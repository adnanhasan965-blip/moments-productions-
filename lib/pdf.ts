import "server-only";
import { cookies, headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function appOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

/** Current request's cookies as a header string (to forward the session). */
export async function currentCookieHeader(): Promise<string> {
  const store = await cookies();
  return store
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
}

/**
 * Print any internal page to an A4 PDF buffer via headless Chromium.
 * Forwards the caller's cookies so the printable page loads *as the
 * logged-in user* — the print pages read data through RLS, so without
 * the session they'd 404 and the PDF would be blank.
 */
export async function renderUrlToPdf(
  url: string,
  cookieHeader?: string
): Promise<Uint8Array> {
  const puppeteer = (await import("puppeteer")).default;
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();

    if (cookieHeader) {
      const cookies = cookieHeader
        .split(";")
        .map((pair) => {
          const i = pair.indexOf("=");
          if (i < 0) return null;
          return { name: pair.slice(0, i).trim(), value: pair.slice(i + 1).trim(), url };
        })
        .filter((c): c is { name: string; value: string; url: string } => !!c && !!c.name);
      if (cookies.length) await page.setCookie(...cookies);
    }

    await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
    return await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
    });
  } finally {
    await browser.close();
  }
}

/**
 * Render a document's printable page and store the PDF in the
 * `documents` bucket. Runs inside an authed server action, so it reads
 * data and writes storage as the current user (via their session).
 */
export async function generateDocumentPdf(documentId: string): Promise<{
  path?: string;
  error?: string;
}> {
  const supabase = await createClient();
  const { data: doc } = await supabase
    .from("documents")
    .select("id, project_id, doc_number, share_key")
    .eq("id", documentId)
    .single();

  if (!doc) return { error: "Document not found" };

  try {
    const origin = await appOrigin();
    const cookieHeader = await currentCookieHeader();
    const pdf = await renderUrlToPdf(
      `${origin}/print/doc/${doc.id}?key=${doc.share_key}`,
      cookieHeader
    );

    const path = `${doc.project_id}/${doc.doc_number}.pdf`;
    const { error } = await supabase.storage
      .from("documents")
      .upload(path, Buffer.from(pdf), {
        contentType: "application/pdf",
        upsert: true,
      });
    if (error) return { error: error.message };

    await supabase.from("documents").update({ pdf_path: path }).eq("id", doc.id);
    return { path };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "PDF generation failed" };
  }
}

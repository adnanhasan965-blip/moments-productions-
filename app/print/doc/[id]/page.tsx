import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { DocumentSheet } from "@/components/documents/doc-template";
import { PrintButton } from "@/components/documents/print-button";
import type { DocumentRow } from "@/lib/documents";

export const dynamic = "force-dynamic";

export default async function PrintDocumentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ key?: string }>;
}) {
  const { id } = await params;
  const { key } = await searchParams;
  if (!key) notFound();

  const supabase = createAdminClient();
  const { data: doc } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .eq("share_key", key)
    .single<DocumentRow>();

  if (!doc) notFound();

  return (
    <main className="min-h-screen bg-black/90 py-8 print:bg-transparent print:py-0">
      <div className="mx-auto mb-6 flex w-full max-w-[190mm] justify-end px-4 print:hidden">
        <PrintButton />
      </div>
      <div className="shadow-2xl print:shadow-none">
        <DocumentSheet doc={doc} />
      </div>
    </main>
  );
}

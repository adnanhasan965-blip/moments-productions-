import Image from "next/image";
import { formatDate, formatMoney } from "@/lib/format";
import {
  docLabel,
  type DocumentRow,
  type InvoiceSnapshot,
  type ReceiptSnapshot,
} from "@/lib/documents";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-8 border-b border-black/15 py-2 text-sm">
      <span className="shrink-0 text-black/55">{label}</span>
      <span className="text-end font-bold">{value}</span>
    </div>
  );
}

function DocHeader({ doc, title }: { doc: DocumentRow; title: string }) {
  const lang = doc.language;
  return (
    <header className="flex items-start justify-between gap-6">
      <div>
        <Image
          src="/brand/logo.png"
          alt="Moments Productions"
          width={1200}
          height={436}
          className="h-14 w-auto"
          priority
        />
        <p
          className="mt-1 text-sm italic text-black/55"
          style={{ fontFamily: "var(--font-editorial)" }}
        >
          {docLabel("tagline", lang)}
        </p>
      </div>
      <div className="text-end">
        <h1 className="text-4xl">{title}</h1>
        <p className="mt-1 text-sm">
          {docLabel("number", lang)}{" "}
          <span className="font-bold">{doc.doc_number}</span>
        </p>
      </div>
    </header>
  );
}

function SignatureLine({ label }: { label: string }) {
  return (
    <div className="flex-1">
      <div className="h-16 border-b border-black" />
      <p className="mt-2 text-xs tracking-widest text-black/55">
        {label.toUpperCase()}
      </p>
    </div>
  );
}

export function ReceiptTemplate({ doc }: { doc: DocumentRow }) {
  const s = doc.snapshot as ReceiptSnapshot;
  const lang = doc.language;
  const loc = lang;

  return (
    <article className="space-y-10">
      <DocHeader doc={doc} title={docLabel("receipt_title", lang)} />

      <div className="viewfinder p-8">
        <span className="vf absolute inset-0" />
        <p className="text-xs tracking-[0.25em] text-black/55">
          {docLabel("amount", lang).toUpperCase()}
        </p>
        <p className="mt-2 text-5xl" dir="ltr">
          {formatMoney(s.amount, s.currency, loc)}
        </p>
      </div>

      <div>
        <Row label={docLabel("received_from", lang)} value={s.crewName} />
        {s.crewRole && <Row label={docLabel("role", lang)} value={s.crewRole} />}
        <Row label={docLabel("project", lang)} value={s.projectName} />
        <Row
          label={docLabel("payment_date", lang)}
          value={formatDate(s.paymentDate, loc)}
        />
        {s.paymentMethod && (
          <Row label={docLabel("payment_method", lang)} value={s.paymentMethod} />
        )}
      </div>

      {s.notes && (
        <div className="text-sm">
          <p className="text-black/55">{docLabel("notes", lang)}</p>
          <p className="mt-1 whitespace-pre-wrap">{s.notes}</p>
        </div>
      )}

      <div className="flex gap-12 pt-10">
        <SignatureLine label={docLabel("payer_signature", lang)} />
        <SignatureLine label={docLabel("receiver_signature", lang)} />
      </div>
    </article>
  );
}

export function InvoiceTemplate({ doc }: { doc: DocumentRow }) {
  const s = doc.snapshot as InvoiceSnapshot;
  const lang = doc.language;
  const loc = lang;
  // "total only" invoices list items without amounts; total typed manually
  const itemized = s.showItemAmounts !== false;

  return (
    <article className="space-y-10">
      <DocHeader doc={doc} title={docLabel("invoice_title", lang)} />

      <div className="flex flex-wrap justify-between gap-8">
        <div className="text-sm">
          <p className="text-xs tracking-[0.25em] text-black/55">
            {docLabel("bill_to", lang).toUpperCase()}
          </p>
          <p className="mt-2 text-lg font-bold">{s.clientName}</p>
          {s.clientContact && <p className="text-black/70">{s.clientContact}</p>}
          <p className="mt-2 text-black/70">
            {docLabel("project", lang)}: {s.projectName}
          </p>
        </div>
        <div className="text-sm">
          <Row label={docLabel("issue_date", lang)} value={formatDate(s.issueDate, loc)} />
          {s.dueDate && (
            <Row label={docLabel("due_date", lang)} value={formatDate(s.dueDate, loc)} />
          )}
        </div>
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-y border-black">
            <th className="py-2 text-start text-xs tracking-[0.2em] text-black/55">
              {docLabel("description", lang).toUpperCase()}
            </th>
            <th className="py-2 text-end text-xs tracking-[0.2em] text-black/55">
              {itemized ? docLabel("amount", lang).toUpperCase() : ""}
            </th>
          </tr>
        </thead>
        <tbody>
          {s.items.map((item, i) => (
            <tr key={i} className="border-b border-black/15">
              <td className="py-3">{item.description}</td>
              <td className="py-3 text-end whitespace-nowrap" dir="ltr">
                {itemized ? formatMoney(item.amount, s.currency, loc) : ""}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          {(itemized || s.discount > 0) && (
            <tr>
              <td className="py-2 pe-6 text-end text-black/55">{docLabel("subtotal", lang)}</td>
              <td className="py-2 text-end whitespace-nowrap" dir="ltr">
                {formatMoney(s.subtotal, s.currency, loc)}
              </td>
            </tr>
          )}
          {s.discount > 0 && (
            <tr>
              <td className="py-2 pe-6 text-end text-black/55">{docLabel("discount", lang)}</td>
              <td className="py-2 text-end whitespace-nowrap" dir="ltr">
                −{formatMoney(s.discount, s.currency, loc)}
              </td>
            </tr>
          )}
          <tr className="border-t border-black">
            <td className="py-3 pe-6 text-end font-bold">{docLabel("total", lang)}</td>
            <td className="py-3 text-end text-xl font-bold whitespace-nowrap" dir="ltr">
              {formatMoney(s.total, s.currency, loc)}
            </td>
          </tr>
        </tfoot>
      </table>

      <div className="grid gap-6 text-sm sm:grid-cols-2">
        {s.paymentTerms && (
          <div>
            <p className="text-xs tracking-[0.25em] text-black/55">
              {docLabel("payment_terms", lang).toUpperCase()}
            </p>
            <p className="mt-2 whitespace-pre-wrap">{s.paymentTerms}</p>
          </div>
        )}
        {s.bank && Object.values(s.bank).some(Boolean) ? (
          <div>
            <p className="text-xs tracking-[0.25em] text-black/55">
              {docLabel("bank_details", lang).toUpperCase()}
            </p>
            <dl className="mt-2 space-y-1">
              {(
                [
                  ["bank_account_name", s.bank.accountName],
                  ["bank_name", s.bank.bankName],
                  ["bank_branch", s.bank.branch],
                  ["bank_iban", s.bank.iban],
                  ["bank_account_number", s.bank.accountNumber],
                  ["bank_swift", s.bank.swift],
                ] as const
              )
                .filter(([, value]) => value)
                .map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-4">
                    <dt className="shrink-0 text-black/55">
                      {docLabel(key, lang)}
                    </dt>
                    <dd className="text-end font-bold" dir="ltr">
                      {value}
                    </dd>
                  </div>
                ))}
            </dl>
          </div>
        ) : (
          s.bankDetails && (
            <div>
              <p className="text-xs tracking-[0.25em] text-black/55">
                {docLabel("bank_details", lang).toUpperCase()}
              </p>
              <p className="mt-2 whitespace-pre-wrap" dir="ltr">
                {s.bankDetails}
              </p>
            </div>
          )
        )}
      </div>

      {s.notes && (
        <div className="text-sm">
          <p className="text-black/55">{docLabel("notes", lang)}</p>
          <p className="mt-1 whitespace-pre-wrap">{s.notes}</p>
        </div>
      )}
    </article>
  );
}

export function DocumentSheet({ doc }: { doc: DocumentRow }) {
  return (
    <div
      dir={doc.language === "ar" ? "rtl" : "ltr"}
      lang={doc.language}
      className="relative mx-auto w-full max-w-[190mm] bg-[#F5F0E8] p-5 sm:p-10 print:min-h-[277mm] print:w-[190mm] text-black"
    >
      {doc.status === "void" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="rotate-[-20deg] border-8 border-[#E50914] px-10 py-4 text-8xl text-[#E50914] opacity-60 font-display">
            {docLabel("void", doc.language)}
          </span>
        </div>
      )}
      {doc.doc_type === "receipt" ? (
        <ReceiptTemplate doc={doc} />
      ) : (
        <InvoiceTemplate doc={doc} />
      )}
      <footer className="mt-16 border-t border-black/20 pt-4 text-center text-[10px] tracking-[0.3em] text-black/55">
        MOMENTS PRODUCTIONS · KUWAIT · THE WORLD
      </footer>
    </div>
  );
}

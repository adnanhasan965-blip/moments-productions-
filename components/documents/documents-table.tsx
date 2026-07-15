"use client";

import { useLocale, useTranslations } from "next-intl";

import { useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  retryDocumentPdf,
  voidDocument,
} from "@/app/(app)/projects/[id]/document-actions";
import { formatDate, formatMoney } from "@/lib/format";
import type {
  DocumentRow,
  InvoiceSnapshot,
  ReceiptSnapshot,
} from "@/lib/documents";

function docAmount(doc: DocumentRow): number {
  return doc.doc_type === "receipt"
    ? (doc.snapshot as ReceiptSnapshot).amount
    : (doc.snapshot as InvoiceSnapshot).total;
}

function docName(doc: DocumentRow): string {
  return doc.doc_type === "receipt"
    ? (doc.snapshot as ReceiptSnapshot).crewName
    : (doc.snapshot as InvoiceSnapshot).clientName;
}

function RowActions({ doc, projectId }: { doc: DocumentRow; projectId: string }) {
  const t = useTranslations();
  const [pending, startTransition] = useTransition();
  const printUrl = `/print/doc/${doc.id}?key=${doc.share_key}`;

  return (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="sm" asChild>
        <a href={printUrl} target="_blank" rel="noreferrer">
          {t("common.open")}
        </a>
      </Button>
      {doc.pdf_url ? (
        <Button variant="ghost" size="sm" asChild>
          <a href={doc.pdf_url} download={`${doc.doc_number}.pdf`}>
            {t("docs.pdf")}
          </a>
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          disabled={pending}
          onClick={() => startTransition(() => retryDocumentPdf(doc.id, projectId))}
        >
          {pending ? "…" : t("docs.makePdf")}
        </Button>
      )}
      {doc.status === "active" && (
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive"
          disabled={pending}
          onClick={() => {
            if (window.confirm(t("docs.voidConfirm", { number: doc.doc_number }))) {
              startTransition(() => voidDocument(doc.id, projectId));
            }
          }}
        >
          {t("docs.void")}
        </Button>
      )}
    </div>
  );
}

export function DocumentsTable({
  documents,
  projectId,
}: {
  documents: DocumentRow[];
  projectId: string;
}) {
  const t = useTranslations();
  const locale = useLocale();
  return (
    <div className="overflow-x-auto border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("docs.colNumber")}</TableHead>
            <TableHead>{t("docs.colType")}</TableHead>
            <TableHead>{t("docs.colFor")}</TableHead>
            <TableHead className="text-end">{t("docs.colAmount")}</TableHead>
            <TableHead>{t("docs.colLang")}</TableHead>
            <TableHead>{t("docs.colCreated")}</TableHead>
            <TableHead>{t("docs.colStatus")}</TableHead>
            <TableHead className="w-48" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                {t("docs.empty")}
              </TableCell>
            </TableRow>
          )}
          {documents.map((doc) => (
            <TableRow key={doc.id} className={doc.status === "void" ? "opacity-50" : ""}>
              <TableCell className="font-bold whitespace-nowrap">
                {doc.doc_number}
              </TableCell>
              <TableCell className="text-xs uppercase tracking-wider">
                {t(`docs.${doc.doc_type}`)}
              </TableCell>
              <TableCell>{docName(doc)}</TableCell>
              <TableCell className="text-end whitespace-nowrap">
                {formatMoney(docAmount(doc), doc.snapshot.currency, locale)}
              </TableCell>
              <TableCell className="text-xs uppercase">{doc.language}</TableCell>
              <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                {formatDate(doc.created_at, locale)}
              </TableCell>
              <TableCell>
                {doc.status === "void" ? (
                  <Badge variant="destructive">{t("docs.void")}</Badge>
                ) : (
                  <Badge variant="outline">{t("docs.active")}</Badge>
                )}
              </TableCell>
              <TableCell>
                <RowActions doc={doc} projectId={projectId} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

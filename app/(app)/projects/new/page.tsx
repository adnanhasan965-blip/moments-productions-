import { getTranslations } from "next-intl/server";
import { ProjectForm } from "@/components/project-form";
import { createProject } from "@/app/(app)/projects/actions";

export default async function NewProjectPage() {
  const t = await getTranslations("projectForm");
  return (
    <main className="mx-auto max-w-3xl space-y-8 px-6 py-10">
      <h1 className="text-4xl">{t("newTitle")}</h1>
      <ProjectForm action={createProject} submitLabel={t("create")} />
    </main>
  );
}

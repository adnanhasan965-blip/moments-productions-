import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { ProjectForm } from "@/components/project-form";
import { updateProject } from "@/app/(app)/projects/actions";
import type { Project } from "@/lib/types";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single<Project>();

  if (!project) notFound();

  const action = updateProject.bind(null, project.id);
  const t = await getTranslations("projectForm");

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-6 py-10">
      <h1 className="text-4xl">{t("editTitle")}</h1>
      <ProjectForm action={action} project={project} submitLabel={t("saveChanges")} />
    </main>
  );
}

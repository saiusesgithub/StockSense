import { Construction } from "lucide-react";

type PlaceholderPageProps = {
  title: string;
  description?: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
        <Construction className="h-6 w-6 text-slate-500" />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
      {description ? <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p> : null}
      <span className="mt-5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
        Foundation ready · UI coming next
      </span>
    </div>
  );
}

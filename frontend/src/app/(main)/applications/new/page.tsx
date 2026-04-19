import { ApplicationForm } from "@/components/ApplicationForm";

export default function NewApplicationPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">新建申请</h1>
      <p className="mt-1 text-slate-600">必填：公司、岗位、状态；其余可折叠填写。</p>
      <div className="mt-6">
        <ApplicationForm mode="create" />
      </div>
    </div>
  );
}

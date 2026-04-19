import Link from "next/link";
import { ApplicationForm } from "@/components/ApplicationForm";

export default function NewApplicationPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">新建申请</h1>
      <p className="mt-1 text-slate-600">必填：公司、岗位、状态；其余可折叠填写。</p>
      <p className="mt-2 text-sm text-slate-600">
        刷招聘平台时可先用
        <Link
          href="/applications/new/quick"
          className="mx-1 text-indigo-600 hover:underline"
        >
          极简建档
        </Link>
        只填核心几项。
      </p>
      <div className="mt-6">
        <ApplicationForm mode="create" />
      </div>
    </div>
  );
}

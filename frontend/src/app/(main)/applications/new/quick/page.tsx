import Link from "next/link";
import { ApplicationForm } from "@/components/ApplicationForm";

export default function QuickNewApplicationPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">极简新建申请</h1>
      <p className="mt-1 text-slate-600">
        填写公司、岗位、状态及可选截止与链接；其余之后在详情页补充。
      </p>
      <p className="mt-2 text-sm text-slate-600">
        需要更多字段？
        <Link
          href="/applications/new"
          className="ml-1 text-indigo-600 hover:underline"
        >
          打开完整表单
        </Link>
      </p>
      <div className="mt-6">
        <ApplicationForm mode="create" compact />
      </div>
    </div>
  );
}

import Link from "next/link";
import { navigation } from "@/lib/navigation";
import { LogoutButton } from "@/components/logout-button";

export function Sidebar() {
  return (
    <aside className="w-[260px] shrink-0 border-r border-line bg-[#0d1118] px-4 py-5 max-[900px]:w-full max-[900px]:border-r-0 max-[900px]:border-b">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent text-lg font-black text-ink">S</div>
        <div><div className="text-sm font-bold tracking-[.2em]">STOKS</div><div className="text-[10px] uppercase tracking-[.18em] text-muted">Operasyon merkezi</div></div>
      </div>
      <nav className="space-y-5">
        {navigation.map((section, index) => <div key={section.label ?? `section-${index}`}>
          {section.label && <div className="mb-2 px-3"><div className="text-[10px] font-bold tracking-[.16em] text-[#8994a3]">{section.label}</div>{section.description && <div className="mt-1 text-[10px] text-[#566171]">{section.description}</div>}</div>}
          <div className="space-y-1">{section.items.map((item, itemIndex) => <Link key={item.href} href={item.href as never} className={itemIndex === 0 && index === 0 ? "flex items-center gap-3 rounded-lg bg-[#202735] px-3 py-2.5 text-sm font-medium text-white" : "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted transition hover:bg-[#171e29] hover:text-white"}><span className="w-5 text-center text-accent">{item.icon}</span><span className="min-w-0"><span className="block">{item.label}</span>{item.description && <span className="hidden truncate text-[10px] text-[#596575] lg:block">{item.description}</span>}</span></Link>)}</div>
        </div>)}
      </nav>
      <div className="mt-10 rounded-xl border border-line bg-[#11161e] p-3"><div className="mb-2 flex items-center justify-between"><span className="eyebrow">Canlı sistem</span><span className="h-2 w-2 rounded-full bg-success" /></div><p className="m-0 text-xs leading-5 text-muted">Operasyon verileri güvenli şekilde tek merkezde.</p><LogoutButton /></div>
    </aside>
  );
}

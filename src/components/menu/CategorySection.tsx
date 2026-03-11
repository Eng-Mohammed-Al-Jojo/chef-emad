import ItemRow from "./ItemRow";
import type { Category, Item } from "./Menu";
import { motion } from "framer-motion"; // <=== Framer Motion

interface Props {
  category: Category;
  items: Item[];
  orderSystem: boolean;
}

export default function CategorySection({ category, items, orderSystem }: Props) {
  return (
    <section className="w-full px-4 md:px-0 py-8 flex flex-col">

      {/* ===== Premium Category Header ===== */}
      <div className="flex items-center gap-4 mb-10">

        {/* البار الجانبي */}
        <div className="relative">
          <div className="h-10 w-1.5 bg-[#E5CB60] rounded-full shadow-lg shadow-[rgba(229,203,96,0.5)]"></div>
          <div className="absolute inset-0 bg-[#E5CB60] blur-md opacity-40"></div>
        </div>

        {/* اسم القسم مع أنيميشن احترافي */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}           // يبدأ من اليمين
          whileInView={{ opacity: 1, x: 0 }}       // يتحرك لمكانه الطبيعي
          transition={{ duration: 2, type: "spring", stiffness: 120, damping: 12 }} // حركة ديناميكية وناعمة
          viewport={{ once: true }}
        >
          <div className="flex flex-col">
            <h2
              className="
                font-[Cairo]
                font-black
                text-[#E5CB60]
                text-2xl md:text-3xl
                tracking-tight
              "
            >
              {category.name}
            </h2>

            {/* عدد الأصناف */}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] font-bold text-[#E5CB60] bg-[#E5CB60]/10 px-2 py-0.5 rounded-lg border border-[#E5CB60]/20">
                {items.length > 1 ? `${items.length} أصناف` : `${items.length} صنف`}
              </span>

              <div className="h-px w-10 bg-[#E5CB60]/30"></div>
            </div>
          </div>
        </motion.div>

        {/* الخط الممتد */}
        <div className="flex-1 h-px bg-linear-to-l from-[#E5CB60]/40 to-transparent"></div>
      </div>

      {/* ===== Items ===== */}
      <div className="flex flex-col gap-2 w-full max-w-full mx-auto">
        {items.map((item) => (
          <motion.div
            initial={{ opacity: 0, x: 50 }}           // يبدأ من اليمين
            whileInView={{ opacity: 1, x: 0 }}       // يتحرك لمكانه الطبيعي
            transition={{ duration: 2, type: "keyframes", stiffness: 120, damping: 12 }} // حركة ديناميكية وناعمة
            viewport={{ once: true }}
          >
            <ItemRow
              item={item}
              orderSystem={orderSystem}
            />
          </motion.div>
        ))}
      </div>

    </section>
  );
}
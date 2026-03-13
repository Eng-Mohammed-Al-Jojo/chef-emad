import ItemRow from "./ItemRow";
import type { Category, Item } from "./Menu";
import { motion } from "framer-motion";

interface Props {
  category: Category;
  items: Item[];
  orderSystem: boolean;
}

export default function CategorySection({ category, items, orderSystem }: Props) {
  return (
    <section className="w-full px-4 md:px-0 py-12 md:py-16">
      {/* Category Header */}
      <div className="relative mb-8 md:mb-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="flex flex-col items-start gap-2"
        >
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-gold rounded-full gold-glow" />
            <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight">
              {category.name}
            </h2>
          </div>

          <div className="flex items-center gap-3 pr-4">
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-gold/60">
              {items.length} {items.length > 1 ? "أصناف" : "صنف"}
            </span>
            <div className="h-px w-12 bg-gold/20" />
          </div>
        </motion.div>

        {/* Premium Background Accent */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-gold/5 blur-[100px] rounded-full pointer-events-none" />
      </div>

      {/* Items Grid/List */}
      <div className="grid grid-cols-1 gap-3 md:gap-4 lg:gap-5 w-full">
        {items.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            orderSystem={orderSystem}
          />
        ))}
      </div>
    </section>
  );
}

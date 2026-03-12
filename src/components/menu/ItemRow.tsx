import { type Item } from "./Menu";
import { motion } from "framer-motion";

interface Props {
  item: Item;
  orderSystem: boolean;
}

export default function ItemRow({ item }: Props) {
  const unavailable = item.visible === false;
  const hasIngredients = !!item.ingredients;
  const prices = String(item.price).split(",");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={!unavailable ? { scale: 1.01, y: -2 } : {}}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`
        group relative overflow-hidden
        rounded-2xl md:rounded-3xl
        p-px 
        ${unavailable ? "opacity-40 grayscale" : "bg-linear-to-b from-gold/20 via-gold/5 to-transparent"}
        transition-all duration-500
      `}
    >
      <div
        className="
    relative z-10
    rounded-2xl md:rounded-3xl
    p-4 md:p-6
    bg-luxury-black/80 backdrop-blur-md
    border border-white/5
    flex items-center justify-between
    gap-4 md:gap-8
  "
      >
        {/* Right side (Name + Description) */}
        <div className="flex flex-col gap-1.5 flex-1 text-right">

          <h3
            className={`
      text-md md:text-xl
      font-bold tracking-tight
      ${unavailable
                ? "text-white/40"
                : "text-white group-hover:text-gold transition-colors duration-300"}
    `}
          >
            {item.name}
          </h3>

          {/* المكونات تحت الاسم مباشرة */}
          {hasIngredients && (
            <p
              className={`
        text-sm md:text-base font-light leading-relaxed
        ${unavailable
                  ? "text-white/20"
                  : "text-white/50 group-hover:text-white/70 transition-colors duration-300"}
      `}
            >
              {item.ingredients}
            </p>
          )}
        </div>

        {/* Left side (Price) */}
        <div className="flex items-center shrink-0">
          <div
            className={`
        min-w-[80px] md:min-w-[100px]
        py-2
        rounded-xl md:rounded-2xl
        text-center
        ${unavailable
                ? "bg-white/5 border-white/10"
                : "bg-gold text-luxury-black font-black shadow-lg shadow-gold/20 group-hover:shadow-gold/40 group-hover:scale-105 transition-all duration-300"}
      `}
          >
            <span className="text-base md:text-lg tracking-wider">
              {prices.map((p) => p.trim() + "₪").join(" | ")}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
import { type Item } from "./Menu";
// import { useState } from "react";
// import { useCart } from "../../context/CartContext";
// import { FaCheck } from "react-icons/fa";

interface Props {
  item: Item;
  orderSystem: boolean;
}

export default function ItemRow({ item }: Props) {
  const unavailable = item.visible === false;
  const hasIngredients = !!item.ingredients;

  // Print price to console to debug
  const prices = String(item.price).split(",");


  // const { addItem } = useCart();
  // const [addedPrice, setAddedPrice] = useState<number | null>(null);

  // const handleAdd = (price: number) => {
  //   addItem(item, price);
  //   setAddedPrice(price);
  //   setTimeout(() => setAddedPrice(null), 1200);
  // };

  return (

    <div
      className={`
        relative
        rounded-3xl
        p-px
        bg-linear-to-r from-[#FCD451]/70 via-[#FCD451] to-[#FCD451]/70
        shadow-[0_8px_28px_rgba(229,203,96,0.25)]
        transition-all duration-300
        ${unavailable ? "opacity-50" : "hover:scale-[1.015]"}
      `}
    >
      <div
        className={`
          relative
          rounded-3xl
          p-3 md:p-4
          bg-[#0f0f0f]
          border border-[#E5CB60]/30
          flex items-center justify-between gap-6
          transition-all duration-300
          font-[Cairo]
          ${unavailable ? "line-through text-gray-500" : ""}
        `}
      >
        {/* Glow خفيف */}
        {!unavailable && (
          <div className="absolute inset-0 rounded-3xl bg-[#E5CB60]/5"></div>
        )}

        {/* ===== Card Decoration (Side Accent) ===== */}
        <div className="flex items-center justify-between gap-6 w-full">
          {/* ===== Right Side: Name + Ingredients ===== */}
          <div className="flex flex-col gap-1 flex-1 text-right pr-4 relative z-10">
            <h3
              className={`
                font-[Cairo]
                text-md md:text-lg
                font-bold
                ${unavailable ? "line-through text-gray-500" : "text-[#FCD451]"}
              `}
            >
              {item.name}
            </h3>

            {hasIngredients && (
              <p
                className={`
                  text-sm md:text-base
                  font-[Cairo]
                  leading-relaxed
                  ${unavailable ? "line-through text-gray-500" : "text-[#E5CB60]/60"}
                `}
              >
                {item.ingredients}
              </p>
            )}
          </div>

          {/* ===== Left Side: PRICE BOX (Always Visible) ===== */}
          <div className="flex items-center justify-center min-w-[110px] relative z-10">
            <div
              className="
                  px-4 py-1
                  rounded-xl
                  bg-[#FCD451]       /* خلفية ذهبي فاتح */
                  shadow-[0_4px_12px_rgba(229,203,96,0.5)] /* ظل خفيف */
                  border border-[#FCD451]/50
                "
            >
              <span
                className={`
                  text-md md:text-lg
                  font-black
                  font-[Cairo]
                  tracking-wide
                  ${unavailable ? "line-through text-gray-500" : "text-[#1b1b1b]"}   /* لون السعر */
                `}
              >
                {prices.map((p) => p.trim() + "₪").join(" | ")}
              </span>
            </div>

            {/* --- Order System --- */}
            {/* {orderSystem && (
                <div className="flex flex-col gap-2 w-full">
                  {prices.map((p) => {
                    const price = Number(p.trim());
                    const isAdded = addedPrice === price;

                    return (
                      <button
                        key={price}
                        onClick={() => handleAdd(price)}
                        disabled={unavailable}
                        className={`
                          w-full
                          px-4 py-2
                          rounded-xl
                          border border-[#60340e]
                          font-bold
                          transition-all
                          ${isAdded
                            ? "bg-[#60340e] text-[#F5F5DC]"
                            : "bg-[#F5F5DC] text-[#60340e] hover:bg-[#60340e]/10"
                          }
                        `}
                      >
                        {isAdded ? <FaCheck /> : `${price}₪`}
                      </button>
                    );
                  })}
                </div>
              )} */}
          </div>
        </div>
      </div>
    </div>
  );
}
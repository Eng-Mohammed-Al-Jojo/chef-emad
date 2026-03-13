import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiTrash2, FiEdit, FiCheck } from "react-icons/fi";
import { db } from "../../firebase";
import { ref, update } from "firebase/database";

import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";

import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import type { PopupState, Category } from "./types";
import { HiChevronDown, HiOutlineArrowsUpDown } from "react-icons/hi2";

interface Props {
  categories: Record<string, Category>;
  setPopup: (popup: PopupState) => void;
  newCategoryName: string;
  setNewCategoryName: React.Dispatch<React.SetStateAction<string>>;
}

/* =======================
   العنصر القابل للسحب
======================= */
const SortableCategory: React.FC<{
  cat: Category & { id: string };
  editingId: string | null;
  tempName: string;
  setTempName: React.Dispatch<React.SetStateAction<string>>;
  saveEdit: (id: string) => void;
  startEditing: (id: string, name: string) => void;
  toggleAvailability: (id: string, current: boolean) => void;
  setPopup: (popup: PopupState) => void;
}> = ({
  cat,
  editingId,
  tempName,
  setTempName,
  saveEdit,
  startEditing,
  toggleAvailability,
  setPopup,
}) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: cat.id });

    const style: React.CSSProperties = {
      transform: CSS.Transform.toString(transform),
      transition,
      touchAction: "none",
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        className="
        relative
        bg-white/5
        border border-white/10
        rounded-2xl
        flex
        overflow-hidden
        group
        transition-all duration-300
        hover:border-gold/30
        hover:bg-white/10
      "
      >
        {/* Drag Rail */}
        <div
          {...listeners}
          className="
          cursor-grab select-none
          bg-gold/10
          w-12 sm:w-10
          flex items-center justify-center
          active:scale-95
          transition-colors
          group-hover:bg-gold/20
        "
        >
          <HiOutlineArrowsUpDown className="w-5 h-5 md:w-6 md:h-6 text-gold/60 group-hover:text-gold transition-colors" />
        </div>

        {/* المحتوى */}
        <div className="flex-1 p-2.5 flex flex-col gap-2.5">
          {editingId === cat.id ? (
            <div className="flex items-center gap-2">
              <input
                className="flex-1 bg-luxury-black/40 border border-white/10 px-3 py-2 rounded-xl text-sm text-white outline-none focus:border-gold/50 transition-colors"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                autoFocus
              />
              <button
                onClick={() => saveEdit(cat.id)}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-white transition-all"
              >
                <FiCheck size={14} />
              </button>
            </div>
          ) : (
            <span className={`text-sm font-bold ${cat.available === false ? "text-white/30 italic" : "text-white"}`}>
              {cat.name}
            </span>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => startEditing(cat.id, cat.name)}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 text-white/40 hover:text-blue-400 hover:bg-blue-400/10 transition-all"
              >
                <FiEdit size={14} />
              </button>

              <button
                onClick={() => setPopup({ type: "deleteCategory", id: cat.id })}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 text-white/40 hover:text-red-500 hover:bg-red-500/10 transition-all"
              >
                <FiTrash2 size={14} />
              </button>
            </div>

            <button
              onClick={() => toggleAvailability(cat.id, cat.available ?? true)}
              className={`relative w-12 h-6 rounded-full transition-all duration-300
              ${cat.available !== false ? "bg-gold" : "bg-white/10"}`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-all duration-300
                ${cat.available !== false ? "translate-x-6 bg-luxury-black" : "translate-x-0 bg-white/40"}`}
              />
            </button>
          </div>
        </div>
      </div>
    );
  };

/* =======================
   CategorySection
======================= */
const CategorySection: React.FC<Props> = ({
  categories,
  setPopup,
  newCategoryName,
  setNewCategoryName,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState("");
  const [openCategories, setOpenCategories] = useState(false);

  const startEditing = (id: string, name: string) => {
    setEditingId(id);
    setTempName(name);
  };

  const saveEdit = async (id: string) => {
    if (!tempName.trim()) return;
    await update(ref(db, `categories/${id}`), { name: tempName.trim() });
    setEditingId(null);
    setTempName("");
  };

  const toggleAvailability = async (id: string, current: boolean) => {
    await update(ref(db, `categories/${id}`), {
      available: !current,
    });
  };

  const categoriesArray = Object.entries(categories)
    .map(([id, cat]) => ({ ...cat, id }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categoriesArray.findIndex((c) => c.id === active.id);
    const newIndex = categoriesArray.findIndex((c) => c.id === over.id);

    const newArray = arrayMove(categoriesArray, oldIndex, newIndex);

    const updates: Record<string, any> = {};
    newArray.forEach((cat, index) => {
      updates[`categories/${cat.id}/order`] = index;
    });

    await update(ref(db), updates);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={categoriesArray.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="glass-morphic p-5 md:p-6 rounded-3xl border border-white/5 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-white">الأقسام</h2>
            <div className="px-4 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-bold uppercase tracking-widest">
              {categoriesArray.length} فئة
            </div>
          </div>

          <div className="flex gap-2.5 flex-wrap mb-6">
            <input
              className="flex-1 bg-white/5 border border-white/10 px-3 py-2.5 rounded-xl text-white outline-none focus:border-gold/50 transition-all font-bold placeholder:text-white/20 text-sm"
              placeholder="أدخل اسم قسم جديد..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
            <button
              onClick={() => setPopup({ type: "addCategory" })}
              className="px-6 rounded-xl bg-gold text-luxury-black hover:bg-gold/90 transition-all shadow-lg shadow-gold/20 font-black text-xs uppercase tracking-widest active:scale-95 flex items-center justify-center"
            >
              <FiPlus className="text-lg" />
            </button>
          </div>

        {/* زر عرض الأقسام */}
        <button
          onClick={() => setOpenCategories((p) => !p)}
          className="
              w-full mb-2
              flex items-center justify-between
              px-4 py-3
              bg-white/5
              rounded-xl
              font-black text-xs uppercase tracking-widest text-white/60
              hover:bg-white/10 hover:text-white
              transition-all duration-300
              border border-white/5
            "
        >
          <span>إدارة الأقسام والترتيب</span>

          <HiChevronDown
            className={`w-5 h-5 transition-transform duration-500 ${openCategories ? "rotate-180" : "rotate-0"}`}
          />
        </button>

        {/* Accordion Animation */}
        <AnimatePresence initial={false}>
          {openCategories && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-white/5">
                {categoriesArray.map((cat) => (
                  <SortableCategory
                    key={cat.id}
                    cat={cat}
                    editingId={editingId}
                    tempName={tempName}
                    setTempName={setTempName}
                    saveEdit={saveEdit}
                    startEditing={startEditing}
                    toggleAvailability={toggleAvailability}
                    setPopup={setPopup}
                  />
                ))}
              </div>
              {categoriesArray.length === 0 && (
                <div className="text-center py-10 text-white/20 font-bold border-2 border-dashed border-white/5 rounded-4xl">
                  لا توجد أقسام مضافة بعد
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default CategorySection;

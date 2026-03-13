import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { ref, update, push } from "firebase/database";
import { db } from "../firebase";
import type { Category, Item } from "../components/admin/types";

export const exportToExcel = async (categories: Record<string, Category>, items: Record<string, Item>) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Menu Data");

  worksheet.columns = [
    { header: "Category", key: "category", width: 20 },
    { header: "Item Name", key: "name", width: 30 },
    { header: "Price", key: "price", width: 15 },
    { header: "Ingredients", key: "ingredients", width: 40 },
    { header: "Visible", key: "visible", width: 10 },
  ];

  Object.entries(categories).forEach(([catId, cat]) => {
    const catItems = Object.values(items).filter(i => i.categoryId === catId);
    catItems.forEach(item => {
      worksheet.addRow({
        category: cat.name,
        name: item.name,
        price: item.price,
        ingredients: item.ingredients || "",
        visible: item.visible ? "Yes" : "No",
      });
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  saveAs(blob, `menu_export_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const importFromExcel = async (
  file: File, 
  categories: Record<string, Category>, 
  showToast: (msg: string, type: any) => void
) => {
  const workbook = new ExcelJS.Workbook();
  const buffer = await file.arrayBuffer();
  await workbook.xlsx.load(buffer as any);
  const worksheet = workbook.getWorksheet(1);
  if (!worksheet) return;

  let importedCount = 0;
  const updates: Record<string, any> = {};

  for (let i = 2; i <= worksheet.rowCount; i++) {
    const row = worksheet.getRow(i);
    const catName = row.getCell(1).text;
    const itemName = row.getCell(2).text;
    const price = row.getCell(3).text;
    const ingredients = row.getCell(4).text;

    if (!catName || !itemName || !price) continue;

    let catId = Object.entries(categories).find(([_, c]) => c.name === catName)?.[0];
    
    if (!catId) {
      const newCatRef = push(ref(db, "categories"));
      catId = newCatRef.key!;
      await update(ref(db, `categories/${catId}`), {
        name: catName,
        createdAt: Date.now(),
        order: Object.keys(categories).length + 1
      });
      // Refresh local categories mapping if possible or wait for sync
    }

    const newItemRef = push(ref(db, "items"));
    updates[`items/${newItemRef.key}`] = {
      name: itemName,
      price: price,
      ingredients: ingredients,
      categoryId: catId,
      visible: true,
      createdAt: Date.now()
    };
    importedCount++;
  }

  if (importedCount > 0) {
    await update(ref(db), updates);
    showToast(`تم استيراد ${importedCount} صنف بنجاح`, "success");
  }
};

export const exportToJSON = (categories: any, items: any, settings: any) => {
  const data = {
    categories,
    items,
    settings,
    exportDate: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  saveAs(blob, `menu_backup_${new Date().toISOString().split('T')[0]}.json`);
};

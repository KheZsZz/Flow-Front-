import { api } from "./api";

export const invoiceService = {
  // Recebe os múltiplos arquivos da tela
  async uploadXMLs(files: { uri: string; name: string }[]) {
    const uploadPromises = files.map((file) => {
      const formData = new FormData();

      // O nome do campo aqui ('file' ou 'xml') deve ser exatamente o que você configurou no multer do backend
      formData.append("xml", {
        uri: file.uri,
        name: file.name,
        // type: "application/xml",
      } as any);

      return api.post("/invoices/xml", formData, {
        // headers: { "Content-Type": "multipart/form-data" },
      });
    });

    const responses = await Promise.all(uploadPromises);
    return responses.map((res) => res.data);
  },

  async getInvoices() {
    const response = await api.get("/invoices");
    return response.data;
  },
};

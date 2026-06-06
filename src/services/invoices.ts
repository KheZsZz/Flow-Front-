import { api } from "./api";

export type UploadStatus = "success" | "duplicate" | "error";

export interface UploadResult {
  file: string;
  status: UploadStatus;
  message: string;
  data?: any;
}

export const invoiceService = {
  async uploadXML(file: {
    uri: string;
    name: string;
    mimeType?: string;
  }): Promise<UploadResult> {
    try {
      const formData = new FormData();

      if (file.uri.startsWith("blob:")) {
        const response = await fetch(file.uri);
        const blob = await response.blob();
        formData.append(
          "xml",
          new File([blob], file.name, { type: "text/xml" }),
        );
      } else {
        formData.append("xml", {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || "text/xml",
        } as any);
      }

      const res = await api.post("/invoices/xml", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        transformRequest: [(data) => data],
      });

      return {
        file: file.name,
        status: "success",
        message: "Importada com sucesso",
        data: res.data,
      };
    } catch (error: any) {
      const status = error?.response?.status;
      const serverMessage = error?.response?.data?.error || "Erro desconhecido";

      // 409 = nota já existe no sistema
      if (status === 409) {
        return {
          file: file.name,
          status: "duplicate",
          message: "Nota já cadastrada no sistema",
        };
      }

      return {
        file: file.name,
        status: "error",
        message: serverMessage,
      };
    }
  },

  async uploadXMLs(
    files: { uri: string; name: string; mimeType?: string }[],
  ): Promise<UploadResult[]> {
    return Promise.all(files.map((f) => this.uploadXML(f)));
  },

  async getInvoices() {
    const response = await api.get("/invoices");
    return response.data;
  },
};

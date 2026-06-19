import { Platform } from "react-native";

export interface PickedFile {
  uri: string;
  name: string;
  mimeType?: string;
}

export async function buildUploadForm(
  field: string,
  file: PickedFile,
  fallbackType = "application/octet-stream",
): Promise<FormData> {
  const form = new FormData();

  const isWebBlob =
    Platform.OS === "web" ||
    file.uri.startsWith("blob:") ||
    file.uri.startsWith("data:");

  if (isWebBlob) {
    const res = await fetch(file.uri);
    const blob = await res.blob();
    form.append(
      field,
      new File([blob], file.name, {
        type: file.mimeType || blob.type || fallbackType,
      }),
    );
  } else {
    form.append(field, {
      uri: file.uri,
      name: file.name,
      type: file.mimeType || fallbackType,
    } as any);
  }

  return form;
}

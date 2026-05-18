import Swal from "sweetalert2";

export const showSuccess = (message, title = "Berhasil!") => {
  return Swal.fire({
    icon: "success",
    title: title,
    text: message,
    timer: 2000,
    showConfirmButton: false,
    position: "top-end",
    toast: true,
    background: "#ffffff",
    color: "#1f2937",
    iconColor: "#10b981",
  });
};

export const showError = (message, title = "Error!") => {
  return Swal.fire({
    icon: "error",
    title: title,
    text: message,
    confirmButtonColor: "#ef4444",
    background: "#ffffff",
    color: "#1f2937",
    iconColor: "#ef4444",
  });
};

export const showWarning = (message, title = "Peringatan!") => {
  return Swal.fire({
    icon: "warning",
    title: title,
    text: message,
    confirmButtonColor: "#f59e0b",
    background: "#ffffff",
    color: "#1f2937",
    iconColor: "#f59e0b",
  });
};

export const showInfo = (message, title = "Informasi") => {
  return Swal.fire({
    icon: "info",
    title: title,
    text: message,
    confirmButtonColor: "#3b82f6",
    background: "#ffffff",
    color: "#1f2937",
    iconColor: "#3b82f6",
  });
};

export const showConfirm = async (message, title = "Konfirmasi") => {
  const result = await Swal.fire({
    title: title,
    text: message,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#3b82f6",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Ya, Hapus!",
    cancelButtonText: "Batal",
    background: "#ffffff",
    color: "#1f2937",
  });
  return result.isConfirmed;
};

export const showLoading = (message = "Menyimpan data...") => {
  return Swal.fire({
    title: "Mohon Tunggu",
    text: message,
    allowOutsideClick: false,
    allowEscapeKey: false,
    allowEnterKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

export const closeLoading = () => {
  Swal.close();
};

import Swal from 'sweetalert2';

// Toast notification (auto hide, non-blocking)
export const toast = {
    success: (message: string) => {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: message,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            customClass: {
                popup: 'colored-toast'
            }
        });
    },
    error: (message: string) => {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'error',
            title: message,
            showConfirmButton: false,
            timer: 4000,
            timerProgressBar: true,
            customClass: {
                popup: 'colored-toast'
            }
        });
    },
    warning: (message: string) => {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'warning',
            title: message,
            showConfirmButton: false,
            timer: 3500,
            timerProgressBar: true,
            customClass: {
                popup: 'colored-toast'
            }
        });
    },
    info: (message: string) => {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'info',
            title: message,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            customClass: {
                popup: 'colored-toast'
            }
        });
    },
};

// Modal alerts (centered, requires user action or blocking)
export const alert = {
    success: (title: string, text?: string) => {
        return Swal.fire({
            icon: 'success',
            title: title,
            text: text,
            confirmButtonColor: '#f97316',
            customClass: {
                confirmButton: 'swal-confirm-btn'
            }
        });
    },
    error: (title: string, text?: string) => {
        return Swal.fire({
            icon: 'error',
            title: title,
            text: text,
            confirmButtonColor: '#f97316',
            customClass: {
                confirmButton: 'swal-confirm-btn'
            }
        });
    },
    warning: (title: string, text?: string) => {
        return Swal.fire({
            icon: 'warning',
            title: title,
            text: text,
            confirmButtonColor: '#f97316',
            customClass: {
                confirmButton: 'swal-confirm-btn'
            }
        });
    },
    info: (title: string, text?: string) => {
        return Swal.fire({
            icon: 'info',
            title: title,
            text: text,
            confirmButtonColor: '#f97316',
            customClass: {
                confirmButton: 'swal-confirm-btn'
            }
        });
    },
    confirm: (title: string, text?: string, confirmText = 'Ya', cancelText = 'Batal') => {
        return Swal.fire({
            icon: 'question',
            title: title,
            text: text,
            showCancelButton: true,
            confirmButtonColor: '#f97316',
            cancelButtonColor: '#6b7280',
            confirmButtonText: confirmText,
            cancelButtonText: cancelText,
            customClass: {
                confirmButton: 'swal-confirm-btn',
                cancelButton: 'swal-cancel-btn'
            }
        });
    },
};

// Loading indicator
export const loading = {
    show: (title = 'Memproses...', text?: string) => {
        Swal.fire({
            title: title,
            text: text,
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            },
            customClass: {
                popup: 'swal-loading-popup'
            }
        });
    },
    hide: () => {
        Swal.close();
    },
};

// Export the raw Swal for custom usage
export { Swal };

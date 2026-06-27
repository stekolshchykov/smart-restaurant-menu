export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
	id: string;
	message: string;
	type: ToastType;
	remove: () => void;
}

function generateId(): string {
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		return crypto.randomUUID();
	}
	return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createToastStore() {
	let toasts = $state<Toast[]>([]);

	function add(type: ToastType, message: string): Toast {
		const id = generateId();
		let timeoutId: ReturnType<typeof setTimeout> | null = null;

		function remove() {
			if (timeoutId !== null) {
				clearTimeout(timeoutId);
				timeoutId = null;
			}
			toasts = toasts.filter((toast) => toast.id !== id);
		}

		const toast: Toast = {
			id,
			message,
			type,
			remove
		};

		toasts = [...toasts, toast];
		timeoutId = setTimeout(remove, 4000);

		return toast;
	}

	return {
		get toasts() {
			return toasts;
		},
		success(message: string) {
			return add('success', message);
		},
		error(message: string) {
			return add('error', message);
		},
		info(message: string) {
			return add('info', message);
		}
	};
}

export const toastStore = createToastStore();
export const success = toastStore.success.bind(toastStore);
export const error = toastStore.error.bind(toastStore);
export const info = toastStore.info.bind(toastStore);

import React from "react";

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-[#161616] text-gray-200 p-6 rounded-xl shadow-lg max-w-sm w-full">
                <h2 className="text-lg font-semibold mb-2">{title}</h2>
                <p className="mb-4">{message}</p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-[#1fba11] hover:bg-[#1fba11]/80 rounded"
                    >
                        Excluir
                    </button>
                </div>
            </div>
        </div>
    );
}
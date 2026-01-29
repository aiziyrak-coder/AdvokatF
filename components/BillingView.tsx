import React, { useState } from 'react';
import type { Case, BillingEntry } from '../types';
import { CurrencyDollarIcon, PlusIcon, TrashIcon, DownloadIcon } from './icons';

// Declare jsPDF on the window object for CDN usage
declare global {
    interface Window {
        jspdf: any;
    }
}

interface BillingViewProps {
    caseData: Case | null;
    onUpdateBilling: (newBilling: BillingEntry[]) => void;
    t: (key: string) => string;
}

export const BillingView: React.FC<BillingViewProps> = ({ caseData, onUpdateBilling, t }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [hours, setHours] = useState('');
    const [description, setDescription] = useState('');
    const [rate, setRate] = useState('100'); // Default rate, stored as string for input

    const billing = caseData?.billing || [];

    const handleAddEntry = (e: React.FormEvent) => {
        e.preventDefault();
        const hoursNum = parseFloat(hours);
        const rateNum = parseFloat(rate);

        if (!date || !hours || !description || !rate || hoursNum <= 0 || rateNum < 0) return;
        
        const newEntry: BillingEntry = {
            id: `billing-${Date.now()}`,
            date,
            hours: hoursNum,
            description,
            rate: rateNum,
        };
        onUpdateBilling([...billing, newEntry]);
        
        // Reset form, keep rate for convenience
        setDate(new Date().toISOString().split('T')[0]);
        setHours('');
        setDescription('');
    };
    
    const handleDeleteEntry = (id: string) => {
        onUpdateBilling(billing.filter(entry => entry.id !== id));
    };
    
    const handleExportInvoice = () => {
        if (!caseData || billing.length === 0) return;

        // Ensure jsPDF and autoTable are loaded
        if (!window.jspdf || !(window.jspdf.jsPDF as any).autoTable) {
            alert("PDF generation library is not available.");
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Use a font that supports the characters, e.g., 'helvetica' might not for Cyrillic
        // For simplicity, we stick to helvetica, but a real-world app would need a custom font.
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.text(t('invoice_title'), 105, 20, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`${t('invoice_number')}: INV-${caseData.id.slice(-6)}`, 20, 30);
        doc.text(`${t('invoice_date')}: ${new Date().toLocaleDateString()}`, 20, 35);
        
        doc.setFont("helvetica", "bold");
        doc.text(t('invoice_from'), 20, 45);
        doc.setFont("helvetica", "normal");
        doc.text(t('invoice_advocate_name'), 20, 50);
        doc.text(t('invoice_advocate_details'), 20, 55);

        doc.setFont("helvetica", "bold");
        doc.text(t('invoice_to'), 120, 45);
        doc.setFont("helvetica", "normal");
        doc.text(caseData.clientName, 120, 50);
        doc.text(caseData.title, 120, 55);
        
        const tableData = billing.map(entry => [
            new Date(entry.date).toLocaleDateString(),
            entry.description,
            entry.hours.toFixed(1),
            `$${entry.rate.toFixed(2)}`,
            `$${(entry.hours * entry.rate).toFixed(2)}`
        ]);

        (doc as any).autoTable({
            head: [[t('billing_date'), t('billing_description'), t('billing_hours'), t('billing_rate'), t('billing_total')]],
            body: tableData,
            startY: 70,
            headStyles: { fillColor: [22, 28, 46] },
        });
        
        const finalY = (doc as any).autoTable.previous.finalY;
        
        const totalAmount = billing.reduce((acc, curr) => acc + (curr.hours * curr.rate), 0);

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(t('invoice_subtotal'), 150, finalY + 10, { align: 'right' });
        doc.text(`$${totalAmount.toFixed(2)}`, 190, finalY + 10, { align: 'right' });
        
        doc.text(t('invoice_tax'), 150, finalY + 17, { align: 'right' });
        doc.text(`$0.00`, 190, finalY + 17, { align: 'right' });

        doc.setFontSize(14);
        doc.text(t('invoice_total_due'), 150, finalY + 25, { align: 'right' });
        doc.text(`$${totalAmount.toFixed(2)}`, 190, finalY + 25, { align: 'right' });

        doc.save(`Invoice_${caseData.title.replace(/\s/g, '_')}.pdf`);
    };


    const totalHours = billing.reduce((acc, curr) => acc + curr.hours, 0);
    const totalAmount = billing.reduce((acc, curr) => acc + (curr.hours * curr.rate), 0);

    return (
        <div className="space-y-6 animate-assemble-in">
            {/* Add Entry Form */}
            <div className="polished-pane p-4">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-lg text-[var(--text-primary)]">{t('billing_add_entry')}</h3>
                     <button 
                        onClick={handleExportInvoice} 
                        disabled={billing.length === 0}
                        className="flex items-center gap-2 polished-pane p-2 rounded-lg text-sm text-[var(--text-secondary)] hover:text-white interactive-hover disabled:opacity-50"
                     >
                        <DownloadIcon className="h-5 w-5" />
                        <span>{t('button_export_invoice')}</span>
                    </button>
                </div>
                <form onSubmit={handleAddEntry} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                    <div className="md:col-span-2">
                        <label className="block text-xs text-[var(--text-secondary)] mb-1">{t('billing_description')}</label>
                        <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-2 text-[var(--text-primary)]" required />
                    </div>
                     <div>
                        <label className="block text-xs text-[var(--text-secondary)] mb-1">{t('billing_date')}</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-2 text-[var(--text-primary)]" required />
                    </div>
                    <div>
                        <label className="block text-xs text-[var(--text-secondary)] mb-1">{t('billing_hours')}</label>
                        <input type="number" value={hours} onChange={e => setHours(e.target.value)} step="0.1" min="0.1" className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-2 text-[var(--text-primary)]" required />
                    </div>
                    <div>
                        <label className="block text-xs text-[var(--text-secondary)] mb-1">{t('billing_rate')}</label>
                        <input type="number" value={rate} onChange={e => setRate(e.target.value)} step="1" min="0" className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-2 text-[var(--text-primary)]" required />
                    </div>
                    <button type="submit" className="md:col-span-1 flex items-center justify-center gap-2 bg-[var(--accent-primary)] text-black font-bold py-2 px-4 rounded-lg h-10">
                        <PlusIcon className="h-5 w-5" />
                        <span>{t('button_add')}</span>
                    </button>
                </form>
            </div>

            {/* Billing Table */}
            <div className="polished-pane">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="text-left text-[var(--text-secondary)]">
                            <tr>
                                <th className="p-3">{t('billing_date')}</th>
                                <th className="p-3">{t('billing_description')}</th>
                                <th className="p-3 text-right">{t('billing_hours')}</th>
                                <th className="p-3 text-right">{t('billing_rate')}</th>
                                <th className="p-3 text-right">{t('billing_total')}</th>
                                <th className="p-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {billing.length > 0 ? billing.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(entry => (
                                <tr key={entry.id} className="border-t border-[var(--border-color)]">
                                    <td className="p-3 whitespace-nowrap text-[var(--text-primary)]">{new Date(entry.date).toLocaleDateString()}</td>
                                    <td className="p-3 text-[var(--text-primary)]">{entry.description}</td>
                                    <td className="p-3 text-right font-mono text-[var(--text-primary)]">{entry.hours.toFixed(1)}</td>
                                    <td className="p-3 text-right font-mono text-[var(--text-primary)]">${entry.rate.toFixed(2)}</td>
                                    <td className="p-3 text-right font-mono text-[var(--text-primary)]">${(entry.hours * entry.rate).toFixed(2)}</td>
                                    <td className="p-3 text-right">
                                        <button onClick={() => handleDeleteEntry(entry.id)} className="text-[var(--text-secondary)] hover:text-red-400">
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="text-center p-8 text-[var(--text-secondary)]">{t('billing_no_entries')}</td>
                                </tr>
                            )}
                        </tbody>
                        {billing.length > 0 && (
                            <tfoot className="font-bold text-[var(--text-primary)]">
                                <tr className="border-t-2 border-[var(--border-color)]">
                                    <td className="p-3" colSpan={2}>{t('billing_grand_total')}</td>
                                    <td className="p-3 text-right font-mono">{totalHours.toFixed(1)}</td>
                                    <td></td>
                                    <td className="p-3 text-right font-mono">${totalAmount.toFixed(2)}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </div>
    );
};
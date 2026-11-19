import { Listbox } from "@headlessui/react";
import { Check, ChevronDown } from "lucide-react";

// T inclui "" quando o campo pode estar vazio (ex.: StatusLancamento | "").
interface SelectTreeyoProps<T extends string> {
    /** Opção selecionada; "" mostra o placeholder */
    value: T;
    onChange: (valor: T) => void;
    options: readonly T[];
    placeholder: string;
}

export default function SelectTreeyo<T extends string>({ value, onChange, options, placeholder }: SelectTreeyoProps<T>) {
    return (

        <Listbox value={value} onChange={onChange}>
            <div className="relative w-full">

                <Listbox.Button
                    className="w-full h-11 md:h-10 pl-3 pr-8 rounded-lg bg-fg/[0.05] border border-fg/[0.07] text-base md:text-[13px] text-fg flex items-center justify-between outline-none transition-colors focus:border-fg/25 data-[open]:border-fg/25 cursor-pointer"
                >

                    <span className={`truncate ${!value ? "text-fg-subtle" : ""}`}>
                        {value || placeholder}
                    </span>

                    <ChevronDown
                        size={15}
                        className="text-fg-subtle absolute right-2"
                    />

                </Listbox.Button>

                <Listbox.Options
                    className="
                        absolute
                        top-full
                        mt-1
                        w-full
                        bg-card
                        backdrop-blur-md
                        border border-line
                        rounded-lg

                        shadow-[0_10px_30px_var(--tema-sombra)]
                        overflow-hidden
                        z-50
                        "
                >

                    {options.map((op) => (

                        <Listbox.Option
                            key={op}
                            value={op}
                            className={({ active }) =>
                                `cursor-pointer px-3 py-3 md:py-2 text-base md:text-sm flex items-center justify-between
                                ${active
                                    ? "bg-[#1fba11]/10 text-marca"
                                    : "text-fg"}`
                            }
                        >

                            {({ selected }) => (

                                <>

                                    <span>{op}</span>

                                    {selected && (
                                        <Check size={14} className="text-marca" />
                                    )}

                                </>

                            )}

                        </Listbox.Option>

                    ))}

                </Listbox.Options>

            </div>

        </Listbox>

    );

}

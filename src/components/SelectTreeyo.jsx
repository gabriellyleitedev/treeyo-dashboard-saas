import { Listbox } from "@headlessui/react";
import { Check, ChevronDown } from "lucide-react";

export default function SelectTreeyo({ value, onChange, options, placeholder }) {

    return (

        <Listbox value={value} onChange={onChange}>

            <div className="relative w-full">

                <Listbox.Button
                    className="
w-full bg-[#161616]
backdrop-blur-md
border border-white/5
rounded-lg
h-10
pl-2 pr-8
text-sm
text-neutral-400
flex items-center justify-between
transition-all
focus:border-[#1fba11]
"
                >

                    <span className={!value ? "text-neutral-500" : ""}>
                        {value || placeholder}
                    </span>

                    <ChevronDown
                        size={15}
                        className="text-neutral-500 absolute right-2"
                    />

                </Listbox.Button>

                <Listbox.Options
                    className="
absolute
top-full
mt-1
w-full
bg-[#161616]/5
backdrop-blur-md
border border-white/10
rounded-lg

 shadow-[0_10px_30px_rgba(0,0,0,0.6)]
overflow-hidden
z-50
"
                >

                    {options.map((op) => (

                        <Listbox.Option
                            key={op}
                            value={op}
                            className={({ active }) =>
                                `cursor-pointer px-3 py-2 text-sm flex items-center justify-between
${active
                                    ? "bg-[#1fba11]/10 text-[#1fba11]"
                                    : "text-gray-200"}`
                            }
                        >

                            {({ selected }) => (

                                <>

                                    <span>{op}</span>

                                    {selected && (
                                        <Check size={14} className="text-[#1fba11]" />
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
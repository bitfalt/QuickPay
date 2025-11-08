type AddressCodeTabProps = {
  bytecode: string;
  assembly: string;
};

export const AddressCodeTab = ({ bytecode, assembly }: AddressCodeTabProps) => {
  const formattedAssembly = Array.from(assembly.matchAll(/\w+( 0x[a-fA-F0-9]+)?/g))
    .map(it => it[0])
    .join("\n");

  return (
    <section className="glass-panel space-y-6 rounded-[1.75rem] px-6 py-6 text-[#a7ebf2]">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-[#a7ebf2]/70">Bytecode</h3>
        <div className="code-surface max-h-[420px] overflow-y-auto">
          <pre>{bytecode}</pre>
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-[#a7ebf2]/70">Opcodes</h3>
        <div className="code-surface max-h-[420px] overflow-y-auto">
          <pre>{formattedAssembly}</pre>
        </div>
      </div>
    </section>
  );
};

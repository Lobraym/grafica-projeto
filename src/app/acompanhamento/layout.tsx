export default function AcompanhamentoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="min-h-screen">
        {children}
      </div>
    </div>
  );
}

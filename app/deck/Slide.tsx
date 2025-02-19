interface SlideProps {
  children: React.ReactNode;
}

export function Slide({ children }: SlideProps) {
  return (
    <section className="bg-gradient-to-r from-rally-pink to-rally-coral w-full h-full">
      <div className="w-full h-full flex items-center">
        <div className="w-full max-w-7xl mx-auto px-16 md:px-24 lg:px-32">
            {children}
        </div>
      </div>
    </section>
  )
}

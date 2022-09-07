

const Container = ({ children }) => {
  return (
    <>
      <section className="h-screen">
        <div className="px-6 py-12 h-full">
          {children}
        </div>
      </section>
    </>
  )
}

export default Container
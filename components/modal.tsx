

const Modal = ({ id, children }) => {
  return (
    <>
      <input type="checkbox" id={id} className="modal-toggle" />
      <div className="modal">
        <div className="modal-box">
          {children}
        </div>
      </div>
    </>
  )
}

export default Modal
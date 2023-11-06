import reactDom from 'react-dom';

function ModalPortal({ children }) {
  const el = document.getElementById('body');
  return reactDom.createPortal(children, el);
}

export default ModalPortal;
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import './Modal.css';

export default function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = 'sm',
  showClose = true
}) {
  const maxWidthClass = `modal-${maxWidth}`;

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="modal-overlay"
        onClose={onClose}
      >
        <div className="modal-container">
          <Transition.Child
            as={Fragment}
            enter="modal-backdrop-enter"
            enterFrom="modal-backdrop-enter"
            enterTo="modal-backdrop-enter-active"
            leave="modal-backdrop-exit"
            leaveFrom="modal-backdrop-exit"
            leaveTo="modal-backdrop-exit-active"
          >
            <Dialog.Overlay className="modal-backdrop" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="modal-spacer"
            aria-hidden="true"
          >
            &#8203;
          </span>

          <Transition.Child
            as={Fragment}
            enter="modal-content-enter"
            enterFrom="modal-content-enter"
            enterTo="modal-content-enter-active"
            leave="modal-content-exit"
            leaveFrom="modal-content-exit"
            leaveTo="modal-content-exit-active"
          >
            <div className={`modal-content ${maxWidthClass}`}>
              {showClose && (
                <div className="modal-close">
                  <button
                    type="button"
                    className="modal-close-button"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <svg
                      className="modal-close-icon"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              )}

              {title && (
                <Dialog.Title
                  as="h3"
                  className="modal-title"
                >
                  {title}
                </Dialog.Title>
              )}

              <div className="modal-body">{children}</div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
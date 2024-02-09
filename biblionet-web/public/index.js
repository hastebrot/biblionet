// htmx.logAll();

/**
 * @param {Event} event
 * @param {HTMLDialogElement} dialog
 */
htmx.showModal = (event, dialog) => {
  dialog.showModal();
  /** @type {HTMLButtonElement | null} */
  const button = event.currentTarget;
  if (button) {
    const buttonRect = button.getBoundingClientRect();
    const offsetLeft = 0;
    const offsetTop = window.scrollY;
    dialog.style.left = buttonRect.left + offsetLeft + "px";
    dialog.style.top = buttonRect.top + offsetTop + "px";
  }
};

/**
 * @param {Event} event
 * @param {HTMLDialogElement} dialog
 */
htmx.closeModal = (event, dialog) => {
  const maybeDialog = event.target;
  if (maybeDialog === dialog) {
    dialog.close();
  }
};

htmx.defineExtension("morphx", {
  isInlineSwap: function (swapStyle) {
    return swapStyle === "morph";
  },
  handleSwap: function (swapStyle, target, fragment) {
    const options = {
      ignoreActive: false,
      ignoreActiveValue: false,
      // callbacks: {
      //   beforeNodeMorphed(oldNode, newContent) {
      //     console.log("before", oldNode, newContent);
      //   },
      // },
    };
    if (swapStyle === "morph" || swapStyle === "morph:outerHTML") {
      return Idiomorph.morph(target, fragment.children, {
        morphStyle: "outerHTML",
        ...options,
      });
    } else if (swapStyle === "morph:innerHTML") {
      return Idiomorph.morph(target, fragment.children, {
        morphStyle: "innerHTML",
        ...options,
      });
    }
  },
});

const printDocumentInternal = (content: string) => {
  let newWin = window.open("", `Print-Window-${new Date().getTime()}`);
  if (newWin) {
    newWin.document.open();
    newWin.document.write(content);
    newWin.document.close();
    // setTimeout(function () {
    //     if (newWin) {
    //         newWin.close();
    //     }
    // }, 10);
  }
};

export const printDocument = (content: string) => {
  setTimeout(() => {
    printDocumentInternal(content);
  }, 300);
};

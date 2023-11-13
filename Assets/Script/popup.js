const myButton = document.querySelectorAll("#myButton");
const myPopup = document.getElementById("myPopup");
const closePopup = document.getElementById("closePopup");

myButton.forEach((button)=>{
    button.addEventListener("click", function () {
        console.log("clicked")
        myPopup.classList.add("show");
    });

})

closePopup.addEventListener("click", function () {
    myPopup.classList.remove("show");
});
window.addEventListener("click", function (event) {
    if (event.target == myPopup) {
        myPopup.classList.remove("show");
    }
});
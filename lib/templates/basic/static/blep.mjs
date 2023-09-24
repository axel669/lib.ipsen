let prev = null
setInterval(
    () => {
        const curr = location.hash

        if (prev === curr || curr === "") {
            return
        }

        prev = curr
        console.log(curr)
        const wrapper = document.querySelector("#wrapper")
        const elem = document.querySelector(curr)

        // console.log(elem.offsetTop)
        wrapper.scrollTop = elem.offsetTop - wrapper.offsetTop
    },
    50
)

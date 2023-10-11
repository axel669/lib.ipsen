import { Marked } from "marked"

const parser = new Marked({
    walkTokens(token) {
        console.log(token)
    }
})

export default (md) => {
}

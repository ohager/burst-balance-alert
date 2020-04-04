import {withBasicAuth} from './__toolbelt/withBasicAuth'

export default withBasicAuth((req, res) => {
 res.send(204)
})

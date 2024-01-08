export const info = (process:string, status:any) => {
    console.info(new Date().toISOString(), `${process}: ${status}`)
}

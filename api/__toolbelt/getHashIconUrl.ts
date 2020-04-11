type SizeType = 's' | 'm' | 'l' | 'xl' | 'xxl'

export default (origin: string, text: string, size: SizeType): string => {
    return `${origin}/api/hashicon?text=${text}&size=${size}`
}

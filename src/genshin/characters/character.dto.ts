/**
 * 标准角色数据格式
 */
interface CharacterData {
    id: number
    name: string
    phase: 5 | 4
    nickname?: Array<string>
}
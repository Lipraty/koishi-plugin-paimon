/**
 * 深境螺旋
 */
interface Abyss {
    schedule_id: number
    start_time: string
    end_time: string
    total_battle_times: number
    total_win_times: number
    max_floor: string
    reveal_rank: AbyssCharacterData[]
    defeat_rank: AbyssCharacterData[]
    damage_rank: AbyssCharacterData[]
    take_damage_rank: AbyssCharacterData[]
    normal_skill_rank: AbyssCharacterData[]
    energy_skill_rank: AbyssCharacterData[]
    floors: AbyssFloorData[]
    total_star: number
    is_unlock: boolean
}

/**
 * 深境螺旋角色数据
 */
interface AbyssCharacterData {
    avatar_id: number
    avatar_icon: string
    value: number
    rarity: number
}

/**
 * 深境螺旋单层数据
 */
interface AbyssFloorData {
    index: number
    icon: string
    is_unlock: boolean
    settle_time: string
    star: number
    max_star: number
    levels: AbyssLevelData[]
}

/**
 * 深境螺旋单间数据
 */
interface AbyssLevelData {
    index: number
    star: number
    max_star: number
    battles: AbyssBattleData[]
}

/**
 * 深境螺旋该间战斗数据
 */
interface AbyssBattleData {
    index: number
    timestamp: string
    avatars: AbyssCharacterData[]
}
import { createCommandDecorator } from "./createCommand.decorator";

/**
 * 定义一个顶级选项。
 * @param name 选项名称
 * @param param 选项所需参数
 * @param desc 选项说明文本
 */
export const CmdOption = createCommandDecorator('option')
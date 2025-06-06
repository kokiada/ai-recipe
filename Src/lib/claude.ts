import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface GeneratedMenu {
  mainDish: {
    name: string;
    cookingTime: number;
    calories: number;
    ingredients: string[];
    recipe: string[];
  };
  sideDish: {
    name: string;
    cookingTime: number;
    calories: number;
    ingredients: string[];
    recipe: string[];
  };
  soup: {
    name: string;
    cookingTime: number;
    calories: number;
    ingredients: string[];
    recipe: string[];
  };
  totalTime: number;
  totalCalories: number;
  difficulty: "簡単" | "普通" | "少し手間";
  tags: string[];
  reasoning: string;
}

export interface FridgeItem {
  id: string;
  name: string;
  available: boolean;
  quantity: string;
  unit: string;
}

export interface Settings {
  adults: string;
  children: string;
  allergies: string[];
}

export async function generateMenuWithClaude(
  fridgeItems: FridgeItem[],
  settings: Settings
): Promise<GeneratedMenu> {
  const availableIngredients = fridgeItems
    .filter(item => item.available)
    .map(item => `${item.name}（${item.quantity}${item.unit}）`)
    .join('、');

  const allergyInfo = settings.allergies.length > 0 
    ? `アレルギー: ${settings.allergies.join('、')}` 
    : 'アレルギーなし';

  const familySize = `大人${settings.adults}人、子供${settings.children}人`;

  const prompt = `
あなたは経験豊富な料理研究家です。以下の条件で、今日の夕食の献立（主菜1品、副菜1品、汁物1品）を提案してください。

【利用可能な食材】
${availableIngredients}

【家族構成】
${familySize}

【アレルギー情報】
${allergyInfo}

【重要な制約】
- 【利用可能な食材】に記載された食材のみを使用してください
- 基本調味料（醤油、味噌、塩、砂糖、酢、油、だしの素など）は使用可能とします
- 記載されていない食材は一切使用しないでください
- やむを得ず追加が必要な場合は、理由欄で説明してください

【要件】
- 主婦が作りやすい現実的な料理
- 調理時間は合計30分以内
- 栄養バランスを考慮
- 家族全員が食べられる料理
- 利用可能な食材を最大限活用

【回答形式】
以下のJSON形式で回答してください：

{
  "mainDish": {
    "name": "料理名",
    "cookingTime": 15,
    "calories": 300,
    "ingredients": ["食材1", "食材2"],
    "recipe": ["手順1", "手順2", "手順3"]
  },
  "sideDish": {
    "name": "料理名",
    "cookingTime": 10,
    "calories": 50,
    "ingredients": ["食材1", "食材2"],
    "recipe": ["手順1", "手順2"]
  },
  "soup": {
    "name": "料理名",
    "cookingTime": 5,
    "calories": 30,
    "ingredients": ["食材1", "食材2"],
    "recipe": ["手順1", "手順2"]
  },
  "totalTime": 25,
  "totalCalories": 380,
  "difficulty": "簡単",
  "tags": ["家族向け", "栄養満点"],
  "reasoning": "この献立を提案した理由を簡潔に説明"
}

難易度は「簡単」「普通」「少し手間」から選択してください。
`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    
    // JSONレスポンスを解析
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AIからの回答をJSON形式で解析できませんでした');
    }

    const generatedMenu: GeneratedMenu = JSON.parse(jsonMatch[0]);
    
    // データの妥当性チェック
    if (!generatedMenu.mainDish?.name || !generatedMenu.sideDish?.name || !generatedMenu.soup?.name) {
      throw new Error('献立の生成に失敗しました');
    }

    return generatedMenu;
  } catch (error) {
    console.error('Claude API Error:', error);
    throw new Error('AI献立生成中にエラーが発生しました。しばらく時間をおいて再度お試しください。');
  }
}
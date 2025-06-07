import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface Dish {
  name: string;
  cookingTime: number;
  calories: number;
  ingredients: string[];
  recipe: string[];
}

export interface ShoppingItem {
  name: string;
  price: number;
  reason: string;
}

export interface GeneratedMenu {
  dishes: Dish[];
  totalTime: number;
  totalCalories: number;
  difficulty: "簡単" | "普通" | "少し手間";
  tags: string[];
  reasoning: string;
  shoppingList?: ShoppingItem[];
  totalShoppingCost?: number;
  
  // 後方互換性のため（既存のコードとの互換性）
  mainDish?: Dish;
  sideDish?: Dish;
  soup?: Dish;
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
  settings: Settings,
  userComment?: string,
  dishCount: number = 3,
  enableShopping?: boolean,
  shoppingBudget: number = 500
): Promise<GeneratedMenu> {
  const availableIngredients = fridgeItems
    .filter(item => item.available)
    .map(item => `${item.name}（${item.quantity}${item.unit}）`)
    .join('、');

  const allergyInfo = settings.allergies.length > 0 
    ? `アレルギー: ${settings.allergies.join('、')}` 
    : 'アレルギーなし';

  const familySize = `大人${settings.adults}人、子供${settings.children}人`;

  const commentSection = userComment && userComment.trim() 
    ? `\n【ユーザーからのリクエスト】\n${userComment.trim()}\n` 
    : '';

  const shoppingSection = enableShopping 
    ? `\n【買い足し設定】\n予算: ${shoppingBudget}円以内で追加食材を購入可能\n` 
    : '';

  const getDishDescription = (count: number) => {
    if (count === 1) return "料理1品"
    if (count === 2) return "料理2品"
    if (count === 3) return "献立（主菜1品、副菜1品、汁物1品）"
    return `料理${count}品`
  }

  const prompt = `
あなたは経験豊富な料理研究家です。以下の条件で、今日の夕食の${getDishDescription(dishCount)}を提案してください。

【利用可能な食材】
${availableIngredients}

【家族構成】
${familySize}

【アレルギー情報】
${allergyInfo}${commentSection}${shoppingSection}

【重要な制約】
${enableShopping 
  ? `- 【利用可能な食材】を優先的に使用し、必要に応じて${shoppingBudget}円以内で追加食材を購入してください
- 基本調味料（醤油、味噌、塩、砂糖、酢、油、だしの素など）は使用可能とします
- 追加購入する食材は現実的な価格設定で、合計金額が予算内に収まるようにしてください` 
  : `- 【利用可能な食材】に記載された食材のみを使用してください
- 基本調味料（醤油、味噌、塩、砂糖、酢、油、だしの素など）は使用可能とします
- 記載されていない食材は一切使用しないでください
- やむを得ず追加が必要な場合は、理由欄で説明してください`}

【要件】
- 主婦が作りやすい現実的な料理
- 調理時間は合計30分以内
- 栄養バランスを考慮
- 家族全員が食べられる料理
- 利用可能な食材を最大限活用
- 毎回違った料理や調理法を提案する
- 季節感や時間帯を考慮した料理を心がける

【回答形式】
以下のJSON形式で回答してください：

{
  "dishes": [
    {
      "name": "料理名1",
      "cookingTime": 15,
      "calories": 300,
      "ingredients": ["食材1", "食材2"],
      "recipe": ["手順1", "手順2", "手順3"]
    },
    {
      "name": "料理名2",
      "cookingTime": 10,
      "calories": 50,
      "ingredients": ["食材1", "食材2"],
      "recipe": ["手順1", "手順2"]
    }
  ],
  "totalTime": 25,
  "totalCalories": 350,
  "difficulty": "簡単",
  "tags": ["家族向け", "栄養満点"],
  "reasoning": "この献立を提案した理由を簡潔に説明"${enableShopping ? `,
  "shoppingList": [
    {
      "name": "追加食材名",
      "price": 150,
      "reason": "この食材を追加する理由"
    }
  ],
  "totalShoppingCost": 150` : ''}
}

※dishesには指定された品数分の料理を含めてください。${enableShopping ? '\n※買い足し設定が有効な場合は、shoppingListに必要な追加食材とその価格を含めてください。' : ''}

難易度は「簡単」「普通」「少し手間」から選択してください。
`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      temperature: 1.0,
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
    if (!generatedMenu.dishes || !Array.isArray(generatedMenu.dishes) || generatedMenu.dishes.length === 0) {
      throw new Error('献立の生成に失敗しました');
    }

    // 後方互換性のため、3品の場合は従来の形式も設定
    if (generatedMenu.dishes.length === 3) {
      generatedMenu.mainDish = generatedMenu.dishes[0];
      generatedMenu.sideDish = generatedMenu.dishes[1];
      generatedMenu.soup = generatedMenu.dishes[2];
    }

    return generatedMenu;
  } catch (error) {
    console.error('Claude API Error:', error);
    throw new Error('献立作成中にエラーが発生しました。しばらく時間をおいて再度お試しください。');
  }
}
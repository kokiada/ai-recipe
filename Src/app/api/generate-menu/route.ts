import { NextRequest, NextResponse } from 'next/server';
import { generateMenuWithClaude, FridgeItem, Settings } from '@/lib/claude';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fridgeItems, settings, userComment, dishCount, enableShopping, shoppingBudget }: { 
      fridgeItems: FridgeItem[], 
      settings: Settings, 
      userComment?: string, 
      dishCount?: string | number,
      enableShopping?: boolean,
      shoppingBudget?: number 
    } = body;

    if (!fridgeItems || !settings) {
      return NextResponse.json(
        { error: '必要なデータが不足しています' },
        { status: 400 }
      );
    }

    // 利用可能な食材がない場合の処理
    const availableItems = fridgeItems.filter(item => item.available);
    if (availableItems.length === 0) {
      return NextResponse.json(
        { error: '利用可能な食材がありません。冷蔵庫の中身を確認してください。' },
        { status: 400 }
      );
    }

    const dishCountNum = dishCount ? (typeof dishCount === 'string' ? parseInt(dishCount) || 3 : dishCount) : 3;
    const generatedMenu = await generateMenuWithClaude(fridgeItems, settings, userComment, dishCountNum, enableShopping, shoppingBudget || 500);
    
    return NextResponse.json({ menu: generatedMenu });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
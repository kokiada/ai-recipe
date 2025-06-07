"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

type Screen = "home" | "menu" | "fridge" | "settings"

interface Dish {
  name: string
  cookingTime: number
  calories: number
  ingredients?: string[]
  recipe?: string[]
}

interface ShoppingItem {
  name: string
  price: number
  reason: string
}

interface MenuSet {
  id: string
  dishes?: Dish[]
  mainDish?: Dish
  sideDish?: Dish
  soup?: Dish
  totalTime: number
  totalCalories: number
  difficulty: "簡単" | "普通" | "少し手間"
  tags: string[]
  reasoning?: string
  shoppingList?: ShoppingItem[]
  totalShoppingCost?: number
}

interface FridgeItem {
  id: string
  name: string
  emoji: string
  available: boolean
  quantity: string
  unit: string
}

interface Settings {
  adults: string
  children: string
  allergies: string[]
  backgroundColor: string
}

export default function RakurakuKondate() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home")
  const [isGeneratingMenu, setIsGeneratingMenu] = useState(false)
  const [aiGeneratedMenu, setAiGeneratedMenu] = useState<MenuSet | null>(null)
  const [fridgeItems, setFridgeItems] = useState<FridgeItem[]>([
    { id: "1", name: "鶏肉", emoji: "🍗", available: true, quantity: "300", unit: "g" },
    { id: "2", name: "豚肉", emoji: "🥩", available: true, quantity: "200", unit: "g" },
    { id: "3", name: "牛肉", emoji: "🥩", available: false, quantity: "0", unit: "g" },
    { id: "4", name: "卵", emoji: "🥚", available: true, quantity: "6", unit: "個" },
    { id: "5", name: "玉ねぎ", emoji: "🧅", available: true, quantity: "2", unit: "個" },
    { id: "6", name: "人参", emoji: "🥕", available: true, quantity: "1", unit: "本" },
    { id: "7", name: "じゃがいも", emoji: "🥔", available: false, quantity: "0", unit: "個" },
    { id: "8", name: "キャベツ", emoji: "🥬", available: true, quantity: "1/2", unit: "玉" },
    { id: "9", name: "豆腐", emoji: "🍲", available: true, quantity: "1", unit: "丁" },
    { id: "10", name: "牛乳", emoji: "🥛", available: true, quantity: "500", unit: "ml" },
    { id: "11", name: "米", emoji: "🍚", available: true, quantity: "2", unit: "kg" },
    { id: "12", name: "醤油", emoji: "🍶", available: true, quantity: "1", unit: "本" },
    { id: "13", name: "味噌", emoji: "🥄", available: true, quantity: "500", unit: "g" },
    { id: "14", name: "砂糖", emoji: "🍯", available: false, quantity: "0", unit: "g" },
    { id: "15", name: "塩", emoji: "🧂", available: true, quantity: "1", unit: "袋" },
  ])

  const [settings, setSettings] = useState<Settings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rakuraku-settings')
      if (saved) {
        const parsedSettings = JSON.parse(saved)
        return {
          adults: parsedSettings.adults || "2",
          children: parsedSettings.children || "1", 
          allergies: parsedSettings.allergies || [],
          backgroundColor: parsedSettings.backgroundColor || "#ffffff"
        }
      }
    }
    return {
      adults: "2",
      children: "1",
      allergies: [],
      backgroundColor: "#ffffff",
    }
  })

  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: "", quantity: "", unit: "" })
  const [showAddForm, setShowAddForm] = useState(false)
  const [userComment, setUserComment] = useState("")
  const [dishCount, setDishCount] = useState<string>("")
  const [enableShopping, setEnableShopping] = useState(false)
  const [shoppingBudget, setShoppingBudget] = useState<number>(500)

  useEffect(() => {
    document.documentElement.style.setProperty('--background', settings.backgroundColor)
  }, [settings.backgroundColor])

  useEffect(() => {
    localStorage.setItem('rakuraku-settings', JSON.stringify(settings))
  }, [settings])

  const toggleFridgeItem = (id: string) => {
    setFridgeItems((prev) => prev.map((item) => (item.id === id ? { ...item, available: !item.available } : item)))
  }

  const handleAllergyChange = (allergy: string, checked: boolean) => {
    setSettings((prev) => ({
      ...prev,
      allergies: checked ? [...prev.allergies, allergy] : prev.allergies.filter((a) => a !== allergy),
    }))
  }

  const addFridgeItem = () => {
    if (editForm.name.trim()) {
      const newItem: FridgeItem = {
        id: Date.now().toString(),
        name: editForm.name,
        emoji: "🥘", // デフォルト絵文字
        available: true,
        quantity: editForm.quantity || "1",
        unit: editForm.unit || "個",
      }
      setFridgeItems((prev) => [...prev, newItem])
      setEditForm({ name: "", quantity: "", unit: "" })
      setShowAddForm(false)
    }
  }

  const deleteFridgeItem = (id: string) => {
    setFridgeItems((prev) => prev.filter((item) => item.id !== id))
  }

  const startEdit = (item: FridgeItem) => {
    setEditingItem(item.id)
    setEditForm({ name: item.name, quantity: item.quantity, unit: item.unit })
  }

  const saveEdit = () => {
    if (editingItem && editForm.name.trim()) {
      setFridgeItems((prev) =>
        prev.map((item) =>
          item.id === editingItem
            ? { ...item, name: editForm.name, quantity: editForm.quantity, unit: editForm.unit }
            : item,
        ),
      )
      setEditingItem(null)
      setEditForm({ name: "", quantity: "", unit: "" })
    }
  }

  const cancelEdit = () => {
    setEditingItem(null)
    setEditForm({ name: "", quantity: "", unit: "" })
  }

  // AI献立生成機能
  const generateMenuWithAI = async () => {
    setIsGeneratingMenu(true)
    
    try {
      const response = await fetch('/api/generate-menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fridgeItems,
          settings,
          userComment,
          dishCount,
          enableShopping,
          shoppingBudget,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'AI献立生成に失敗しました')
      }

      const data = await response.json()
      const generatedMenu: MenuSet = {
        id: 'ai-generated',
        ...data.menu,
      }
      
      setAiGeneratedMenu(generatedMenu)
      setCurrentScreen("menu")
    } catch (error) {
      console.error('Menu generation error:', error)
      alert(error instanceof Error ? error.message : 'AI献立生成中にエラーが発生しました')
    } finally {
      setIsGeneratingMenu(false)
    }
  }


  const renderHomeScreen = () => (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50 p-4">
      <div className="max-w-sm mx-auto pt-8">
        <h1 className="text-3xl font-bold text-center text-orange-800 mb-8">らくらく献立</h1>

        <div className="space-y-6">
          {/* コメント入力欄 */}
          {/* 品数選択 */}
          <div className="bg-white/70 rounded-xl p-4 border border-orange-200">
            <label className="block text-sm font-medium text-orange-700 mb-3">
              🍽️ 品数を選択
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="3"
                value={dishCount}
                onChange={(e) => setDishCount(e.target.value)}
                className="w-16 p-3 border border-orange-300 rounded-lg text-center text-lg font-medium focus:outline-none focus:ring-2 focus:ring-orange-400"
                autoComplete="off"
              />
              <span className="text-lg font-medium text-orange-700">品</span>
            </div>
          </div>

          {/* 買い足し設定 */}
          <div className="bg-white/70 rounded-xl p-4 border border-orange-200">
            <div className="flex items-center space-x-3 mb-3">
              <Checkbox
                id="enable-shopping"
                checked={enableShopping}
                onCheckedChange={(checked) => setEnableShopping(checked as boolean)}
              />
              <Label htmlFor="enable-shopping" className="text-base font-medium text-orange-700">
                🛒 食材を買い足す
              </Label>
            </div>
            {enableShopping && (
              <div className="ml-6 flex items-center space-x-3">
                <Label className="text-sm text-orange-700">予算：</Label>
                <input
                  type="number"
                  min="100"
                  max="2000"
                  step="50"
                  value={shoppingBudget}
                  onChange={(e) => setShoppingBudget(Math.max(100, Math.min(2000, Number(e.target.value) || 500)))}
                  className="w-20 p-2 border border-orange-300 rounded-lg text-center text-base focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <span className="text-base text-orange-700">円</span>
              </div>
            )}
          </div>

          {/* コメント入力欄 */}
          <div className="bg-white/70 rounded-xl p-4 border border-orange-200">
            <label className="block text-sm font-medium text-orange-700 mb-2">
              💬 コメント（例：おつまみ、さっぱり系、など）
            </label>
            <textarea
              value={userComment}
              onChange={(e) => setUserComment(e.target.value)}
              placeholder="作りたい料理のリクエストを入力してください"
              className="w-full p-3 border border-orange-300 rounded-lg text-base resize-none focus:outline-none focus:ring-2 focus:ring-orange-400"
              rows={2}
            />
          </div>

          {/* メインボタン - AI献立生成 */}
          <Button
            onClick={generateMenuWithAI}
            disabled={isGeneratingMenu}
            className="w-full h-48 text-2xl font-bold bg-gradient-to-r from-purple-500 to-orange-500 hover:from-purple-600 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-3xl shadow-xl border-4 border-purple-300 hover:border-purple-400 transition-all duration-200 transform hover:scale-105 disabled:transform-none"
          >
            <div className="flex flex-col items-center space-y-2">
              <span className="text-4xl">{isGeneratingMenu ? "🤖" : "✨"}</span>
              <span>{isGeneratingMenu ? "献立作成中..." : "AI献立生成"}</span>
              <span className="text-lg font-medium">
                {isGeneratingMenu ? "冷蔵庫の食材から献立を考えています" : "冷蔵庫の材料から作る！"}
              </span>
            </div>
          </Button>



          {/* サブメニュー */}
          <div className="space-y-3">
            <Button
              onClick={() => setCurrentScreen("fridge")}
              className="w-full h-14 text-lg font-medium bg-green-400 hover:bg-green-500 text-white rounded-xl shadow-md"
            >
              🥬 冷蔵庫を見る
            </Button>

            <Button
              onClick={() => setCurrentScreen("settings")}
              className="w-full h-12 text-base bg-gray-400 hover:bg-gray-500 text-white rounded-lg shadow-sm"
            >
              ⚙️ 設定
            </Button>
          </div>
        </div>

        {/* 昨日の料理表示（要件に基づく） */}
        <div className="mt-8 p-4 bg-white/70 rounded-lg">
          <p className="text-sm text-orange-700 text-center">昨日は「親子丼」でした</p>
        </div>
      </div>
    </div>
  )

  const renderMenuScreen = () => {
    const currentMenu = aiGeneratedMenu
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50 p-4">
        <div className="max-w-sm mx-auto">
          <div className="flex items-center mb-6 pt-4">
            <Button variant="ghost" size="sm" onClick={() => setCurrentScreen("home")} className="p-2">
              <ArrowLeft className="h-6 w-6 text-orange-800" />
            </Button>
            <h2 className="text-2xl font-bold text-orange-800 ml-4">今日の献立</h2>
          </div>

          {/* 献立パターン表示 */}
          <div className="text-center mb-4">
            <span className="text-sm text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
              ✨ AI生成 • {currentMenu?.difficulty}
            </span>
          </div>

          <div className="space-y-4 mb-6">
            {currentMenu?.dishes?.map((dish, index) => {
              const borderColors = [
                "border-orange-400",
                "border-green-400", 
                "border-blue-400",
                "border-purple-400",
                "border-pink-400",
                "border-indigo-400",
                "border-yellow-400",
                "border-red-400",
                "border-teal-400",
                "border-cyan-400"
              ];
              
              const textColors = [
                "text-orange-700",
                "text-green-700",
                "text-blue-700", 
                "text-purple-700",
                "text-pink-700",
                "text-indigo-700",
                "text-yellow-700",
                "text-red-700",
                "text-teal-700",
                "text-cyan-700"
              ];

              return (
                <Card key={index} className={`bg-white shadow-md border-l-4 ${borderColors[index % borderColors.length]}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className={`text-lg ${textColors[index % textColors.length]} flex items-center`}>
                      🍽️ {index + 1}品目
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-semibold text-gray-800">{dish.name}</p>
                    <div className="text-sm text-gray-600 mt-2">
                      <span>🔥 {dish.calories}kcal</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* 合計情報 */}
          <div className="bg-gradient-to-r from-orange-100 to-amber-100 p-4 rounded-xl mb-6 border border-orange-200">
            <div className="flex justify-center items-center mb-2">
              <p className="text-lg font-bold text-orange-800">
                🔥 合計: {currentMenu?.totalCalories}kcal
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentMenu?.tags.map((tag, index) => (
                <span key={index} className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded-full">
                  {tag}
                </span>
              )) || []}
            </div>
          </div>

          {/* AI生成の場合は理由を表示 */}
          {aiGeneratedMenu && currentMenu?.reasoning && (
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-4 rounded-xl mb-6 border border-purple-200">
              <p className="text-sm text-purple-800 font-medium mb-1">🤖 AIからのコメント</p>
              <p className="text-sm text-purple-700">{currentMenu.reasoning}</p>
            </div>
          )}

          {/* 買い足し食材リスト */}
          {aiGeneratedMenu && currentMenu?.shoppingList && currentMenu.shoppingList.length > 0 && (
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-4 rounded-xl mb-6 border border-green-200">
              <p className="text-sm text-green-800 font-medium mb-3">🛒 買い足し食材リスト</p>
              <div className="space-y-2">
                {currentMenu.shoppingList.map((item, index) => (
                  <div key={index} className="flex justify-between items-center bg-white/60 p-3 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-green-800">{item.name}</p>
                      <p className="text-xs text-green-600">{item.reason}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-800">{item.price}円</p>
                    </div>
                  </div>
                ))}
                <div className="border-t border-green-300 pt-2 mt-3">
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-green-800">合計</p>
                    <p className="font-bold text-green-800">{currentMenu.totalShoppingCost}円</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button className="w-full h-16 text-lg font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-lg">
              <div className="flex flex-col items-center">
                <span>✅ この献立にする</span>
                <span className="text-sm opacity-90">レシピを見る</span>
              </div>
            </Button>
            
            <Button 
              onClick={generateMenuWithAI}
              variant="outline" 
              className="w-full h-14 text-base border-2 border-purple-300 text-purple-700 hover:bg-purple-50 rounded-xl"
            >
              ✨ AI献立を再生成
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const renderFridgeScreen = () => (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-50 p-4">
      <div className="max-w-sm mx-auto">
        <div className="flex items-center justify-between mb-6 pt-4">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={() => setCurrentScreen("home")} className="p-2">
              <ArrowLeft className="h-6 w-6 text-green-800" />
            </Button>
            <h2 className="text-2xl font-bold text-green-800 ml-4">冷蔵庫の中身</h2>
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm"
          >
            + 追加
          </Button>
        </div>

        {/* 追加フォーム */}
        {showAddForm && (
          <Card className="mb-4 bg-white shadow-md">
            <CardContent className="p-4">
              <h3 className="font-semibold text-green-800 mb-3">新しい食材を追加</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="食材名"
                  value={editForm.name}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg text-base"
                />
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="量"
                    value={editForm.quantity}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, quantity: e.target.value }))}
                    className="flex-1 p-2 border border-gray-300 rounded-lg text-base"
                  />
                  <input
                    type="text"
                    placeholder="単位"
                    value={editForm.unit}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, unit: e.target.value }))}
                    className="w-20 p-2 border border-gray-300 rounded-lg text-base"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={addFridgeItem} className="flex-1 bg-green-500 hover:bg-green-600 text-white">
                    追加
                  </Button>
                  <Button
                    onClick={() => {
                      setShowAddForm(false)
                      setEditForm({ name: "", quantity: "", unit: "" })
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    キャンセル
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 食材リスト */}
        <div className="space-y-2 mb-8 max-h-96 overflow-y-auto">
          {fridgeItems.map((item) => (
            <div key={item.id}>
              {editingItem === item.id ? (
                /* 編集モード */
                <Card className="bg-blue-50 border-blue-300 shadow-sm">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-lg text-base"
                      />
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={editForm.quantity}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, quantity: e.target.value }))}
                          className="flex-1 p-2 border border-gray-300 rounded-lg text-base"
                        />
                        <input
                          type="text"
                          value={editForm.unit}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, unit: e.target.value }))}
                          className="w-20 p-2 border border-gray-300 rounded-lg text-base"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={saveEdit} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm">
                          保存
                        </Button>
                        <Button onClick={cancelEdit} variant="outline" className="flex-1 text-sm">
                          キャンセル
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                /* 通常表示モード */
                <div
                  className={`
                  flex items-center justify-between p-4 rounded-xl border-2 transition-all
                  ${item.available ? "bg-green-100 border-green-300 shadow-sm" : "bg-gray-100 border-gray-300"}
                `}
                >
                  <div
                    className="flex items-center space-x-3 flex-1 cursor-pointer"
                    onClick={() => toggleFridgeItem(item.id)}
                  >
                    <span className="text-2xl">{item.emoji}</span>
                    <div>
                      <p className={`font-medium text-base ${item.available ? "text-green-800" : "text-gray-500"}`}>
                        {item.name}
                      </p>
                      {item.available && (
                        <p className="text-sm text-green-600">
                          {item.quantity}
                          {item.unit}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div
                      className={`
                      w-6 h-6 rounded-full border-2 flex items-center justify-center
                      ${item.available ? "bg-green-400 border-green-400" : "border-gray-300"}
                    `}
                    >
                      {item.available && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>

                    <Button
                      onClick={() => startEdit(item)}
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 px-2 py-1 text-xs"
                    >
                      編集
                    </Button>

                    <Button
                      onClick={() => deleteFridgeItem(item.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-800 hover:bg-red-100 px-2 py-1 text-xs"
                    >
                      削除
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <Button
          onClick={() => setCurrentScreen("home")}
          className="w-full h-14 text-lg font-semibold bg-green-400 hover:bg-green-500 text-white rounded-xl"
        >
          完了
        </Button>
      </div>
    </div>
  )

  const renderSettingsScreen = () => (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-slate-50 p-4">
      <div className="max-w-sm mx-auto">
        <div className="flex items-center mb-6 pt-4">
          <Button variant="ghost" size="sm" onClick={() => setCurrentScreen("home")} className="p-2">
            <ArrowLeft className="h-6 w-6 text-gray-800" />
          </Button>
          <h2 className="text-2xl font-bold text-gray-800 ml-4">設定</h2>
        </div>

        <div className="space-y-8">
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-gray-800">家族構成</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-base font-medium text-gray-700 mb-3 block">大人</Label>
                <RadioGroup
                  value={settings.adults}
                  onValueChange={(value) => setSettings((prev) => ({ ...prev, adults: value }))}
                  className="flex flex-wrap gap-4"
                >
                  {["1人", "2人", "3人", "4人以上"].map((option, index) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={String(index + 1)} id={`adults-${index + 1}`} />
                      <Label htmlFor={`adults-${index + 1}`} className="text-sm">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label className="text-base font-medium text-gray-700 mb-3 block">子供</Label>
                <RadioGroup
                  value={settings.children}
                  onValueChange={(value) => setSettings((prev) => ({ ...prev, children: value }))}
                  className="flex flex-wrap gap-4"
                >
                  {["0人", "1人", "2人", "3人以上"].map((option, index) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={String(index)} id={`children-${index}`} />
                      <Label htmlFor={`children-${index}`} className="text-sm">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-gray-800">アレルギー設定</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {["卵", "乳製品", "小麦", "そば", "えび・かに"].map((allergy) => (
                  <div key={allergy} className="flex items-center space-x-3">
                    <Checkbox
                      id={allergy}
                      checked={settings.allergies.includes(allergy)}
                      onCheckedChange={(checked) => handleAllergyChange(allergy, checked as boolean)}
                    />
                    <Label htmlFor={allergy} className="text-base">
                      {allergy}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-gray-800">背景色設定</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Label className="text-base font-medium text-gray-700 block">テーマカラー</Label>
                <div className="grid grid-cols-5 gap-3">
                  {[
                    { name: "ホワイト", color: "#ffffff" },
                    { name: "クリーム", color: "#fefce8" },
                    { name: "ピンク", color: "#fce7f3" },
                    { name: "ブルー", color: "#dbeafe" },
                    { name: "グリーン", color: "#dcfce7" },
                    { name: "ラベンダー", color: "#e0e7ff" },
                    { name: "ピーチ", color: "#fed7d7" },
                    { name: "ミント", color: "#d1fae5" },
                    { name: "スカイ", color: "#e0f2fe" },
                    { name: "ライム", color: "#ecfccb" }
                  ].map((theme) => (
                    <button
                      key={theme.name}
                      onClick={() => setSettings(prev => ({ ...prev, backgroundColor: theme.color }))}
                      className={`w-12 h-12 rounded-lg border-2 transition-all ${
                        settings.backgroundColor === theme.color 
                          ? "border-gray-800 border-4" 
                          : "border-gray-300 hover:border-gray-500"
                      }`}
                      style={{ backgroundColor: theme.color }}
                      title={theme.name}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Button
          onClick={() => setCurrentScreen("home")}
          className="w-full h-14 text-lg font-semibold bg-gray-600 hover:bg-gray-700 text-white rounded-xl mt-8"
        >
          保存
        </Button>
      </div>
    </div>
  )

  return (
    <div className="font-sans">
      {currentScreen === "home" && renderHomeScreen()}
      {currentScreen === "menu" && renderMenuScreen()}
      {currentScreen === "fridge" && renderFridgeScreen()}
      {currentScreen === "settings" && renderSettingsScreen()}
    </div>
  )
}

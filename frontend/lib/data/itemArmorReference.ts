export interface ItemArmorReferenceRow {
  code: number;
  name: string;
  armorType: "Head" | "Chest" | "Arm" | "Leg";
  itemGrade: string;
  isCompletedItem: boolean;
  imagePath: string | null;
}

export const ITEM_ARMOR_REFERENCE: ItemArmorReferenceRow[] = 
[
  {
    "code": 201101,
    "name": "머리띠",
    "armorType": "Head",
    "itemGrade": "Common",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/02. Head/001. Hairband.png"
  },
  {
    "code": 201102,
    "name": "모자",
    "armorType": "Head",
    "itemGrade": "Common",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/02. Head/002. Hat.png"
  },
  {
    "code": 201104,
    "name": "자전거헬멧",
    "armorType": "Head",
    "itemGrade": "Common",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/02. Head/003. Bike Helmet.png"
  },
  {
    "code": 201111,
    "name": "프리야패시브Lv2",
    "armorType": "Head",
    "itemGrade": "Common",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/02. Head/004. Mask.png"
  },
  {
    "code": 201112,
    "name": "프리야패시브Lv3",
    "armorType": "Head",
    "itemGrade": "Common",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/02. Head/005. Circlet.png"
  },
  {
    "code": 201201,
    "name": "가면",
    "armorType": "Head",
    "itemGrade": "Common",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/02. Head/006. Beret.png"
  },
  {
    "code": 201202,
    "name": "머리테",
    "armorType": "Head",
    "itemGrade": "Uncommon",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/02. Head/007. Chain Coif.png"
  },
  {
    "code": 201203,
    "name": "베레모",
    "armorType": "Head",
    "itemGrade": "Uncommon",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/02. Head/008. Safety Helmet.png"
  },
  {
    "code": 201204,
    "name": "사슬코이프",
    "armorType": "Head",
    "itemGrade": "Uncommon",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/02. Head/009. Ballistic Helmet.png"
  },
  {
    "code": 201205,
    "name": "안전모",
    "armorType": "Head",
    "itemGrade": "Uncommon",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/02. Head/010. Fire Helmet.png"
  },
  {
    "code": 201206,
    "name": "피어나는봉오리",
    "armorType": "Head",
    "itemGrade": "Uncommon",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/02. Head/011. Crown.png"
  },
  {
    "code": 201301,
    "name": "방탄모",
    "armorType": "Head",
    "itemGrade": "Rare",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/02. Head/012. Close Helm.png"
  },
  {
    "code": 201302,
    "name": "소방헬멧",
    "armorType": "Head",
    "itemGrade": "Rare",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/02. Head/013. Virtuous Outlaw.png"
  },
  {
    "code": 201304,
    "name": "로빈",
    "armorType": "Head",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/014. Crystal Tiara.png"
  },
  {
    "code": 201305,
    "name": "싱그러운꽃잎",
    "armorType": "Head",
    "itemGrade": "Rare",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/02. Head/015. Motorcycle Helmet.png"
  },
  {
    "code": 201401,
    "name": "왕관",
    "armorType": "Head",
    "itemGrade": "Rare",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/02. Head/016. Tactical OPS Helmet.png"
  },
  {
    "code": 201402,
    "name": "투구",
    "armorType": "Head",
    "itemGrade": "Rare",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/02. Head/017. Helm of Banneret.png"
  },
  {
    "code": 201403,
    "name": "미스릴투구",
    "armorType": "Head",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/018. Imperial Crown.png"
  },
  {
    "code": 201404,
    "name": "수정티아라",
    "armorType": "Head",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/019. Imperial Burgonet.png"
  },
  {
    "code": 201405,
    "name": "오토바이헬멧",
    "armorType": "Head",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/020. Mohawk Headgear.png"
  },
  {
    "code": 201406,
    "name": "전술OPS헬멧",
    "armorType": "Head",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/021. Vigilante.png"
  },
  {
    "code": 201407,
    "name": "기사단장의투구",
    "armorType": "Head",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/022. Diadem.png"
  },
  {
    "code": 201408,
    "name": "월계관",
    "armorType": "Head",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/023. Cowboy Hat.png"
  },
  {
    "code": 201409,
    "name": "제국왕관",
    "armorType": "Head",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/024. Plasma Helmet.png"
  },
  {
    "code": 201410,
    "name": "황실부르고넷",
    "armorType": "Head",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/025. Welding Helmet.png"
  },
  {
    "code": 201411,
    "name": "변검",
    "armorType": "Head",
    "itemGrade": "Mythic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/026. White Witch Hat.png"
  },
  {
    "code": 201412,
    "name": "모호크헬멧",
    "armorType": "Head",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/027. Fox Mask.png"
  },
  {
    "code": 201413,
    "name": "비질란테",
    "armorType": "Head",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/028. Sport Sunglasses.png"
  },
  {
    "code": 201414,
    "name": "다이아뎀",
    "armorType": "Head",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/029. The Sailor.png"
  },
  {
    "code": 201415,
    "name": "성기사의투구",
    "armorType": "Head",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/030. Mithril Helm.png"
  },
  {
    "code": 201416,
    "name": "만개하는선율",
    "armorType": "Head",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/031. Laurel Wreath.png"
  },
  {
    "code": 201417,
    "name": "카우보이모자",
    "armorType": "Head",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/032. Crusader Helmet.png"
  },
  {
    "code": 201418,
    "name": "플라즈마투구",
    "armorType": "Head",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/033. Tactical Goggles.png"
  },
  {
    "code": 201419,
    "name": "용접 마스크",
    "armorType": "Head",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/034. Elysian Halo.png"
  },
  {
    "code": 201420,
    "name": "마녀 모자",
    "armorType": "Head",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/035. Fallen Pegasus.png"
  },
  {
    "code": 201421,
    "name": "여우 가면",
    "armorType": "Head",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/036. Persona.png"
  },
  {
    "code": 201422,
    "name": "스포츠 선글라스",
    "armorType": "Head",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/037. Sultan_s Turban.png"
  },
  {
    "code": 201423,
    "name": "전술 고글",
    "armorType": "Head",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/038. Racing Helmet.png"
  },
  {
    "code": 201501,
    "name": "천사의고리",
    "armorType": "Head",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/039. The Star of the Wilds.png"
  },
  {
    "code": 201502,
    "name": "빛의증표",
    "armorType": "Head",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/040.  Astronaut_s Helmet.png"
  },
  {
    "code": 201503,
    "name": "페르소나",
    "armorType": "Head",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/041. Dwarf_s Helmet.png"
  },
  {
    "code": 201504,
    "name": "예언자의터번",
    "armorType": "Head",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/042. Twilight.png"
  },
  {
    "code": 201505,
    "name": "레이싱헬멧",
    "armorType": "Head",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/043. GPNVG.png"
  },
  {
    "code": 201506,
    "name": "황야의별",
    "armorType": "Head",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/044. The Black Death.png"
  },
  {
    "code": 201507,
    "name": "우주비행사의헬멧",
    "armorType": "Head",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/045. Cyberstalker.png"
  },
  {
    "code": 201508,
    "name": "드워프의투구",
    "armorType": "Head",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/046. Blaster Helmet.png"
  },
  {
    "code": 201509,
    "name": "트와일라잇",
    "armorType": "Head",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/047. Commander Headset.png"
  },
  {
    "code": 201516,
    "name": "천상의메아리",
    "armorType": "Head",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/048. Blue Flames.png"
  },
  {
    "code": 201517,
    "name": "천상의메아리-C",
    "armorType": "Head",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/049. Bunny Hat.png"
  },
  {
    "code": 201518,
    "name": "쿼드아이",
    "armorType": "Head",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/050. Legatus.png"
  },
  {
    "code": 201519,
    "name": "검은 죽음",
    "armorType": "Head",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/051. Fencing Mask.png"
  },
  {
    "code": 201520,
    "name": "사이버 스토커",
    "armorType": "Head",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/052. Smart Glasses.png"
  },
  {
    "code": 201521,
    "name": "블래스터헬멧",
    "armorType": "Head",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/053. David Headphones.png"
  },
  {
    "code": 201522,
    "name": "커맨더헤드셋",
    "armorType": "Head",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/054. The Captain.png"
  },
  {
    "code": 201523,
    "name": "스파크실드",
    "armorType": "Head",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/055. Black Veil.png"
  },
  {
    "code": 201524,
    "name": "바니햇",
    "armorType": "Head",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/056. Demon Mask.png"
  },
  {
    "code": 201525,
    "name": "레가투스",
    "armorType": "Head",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/057. Kundala.png"
  },
  {
    "code": 201526,
    "name": "앙 가르드",
    "armorType": "Head",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/058. Tactical_Visor.png"
  },
  {
    "code": 201527,
    "name": "인사이트",
    "armorType": "Head",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/059. The Dragon’s Fury.png"
  },
  {
    "code": 201528,
    "name": "발할라의 투구",
    "armorType": "Head",
    "itemGrade": "Mythic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/060. Chinese Opera Mask.png"
  },
  {
    "code": 201529,
    "name": "아이실드",
    "armorType": "Head",
    "itemGrade": "Mythic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/061. Viking Helmet.png"
  },
  {
    "code": 201530,
    "name": "다비드 헤드폰",
    "armorType": "Head",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/062. Eyeshield.png"
  },
  {
    "code": 201531,
    "name": "마린 햇",
    "armorType": "Head",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/063. Blood Crown.png"
  },
  {
    "code": 201532,
    "name": "캡틴 햇",
    "armorType": "Head",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/064. Featherfall.png"
  },
  {
    "code": 201533,
    "name": "검은 베일",
    "armorType": "Head",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/9996. Crown of Buds.png"
  },
  {
    "code": 201534,
    "name": "붉은 별빛",
    "armorType": "Chest",
    "itemGrade": "Mythic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/01. Chest/001. Windbreaker.png"
  },
  {
    "code": 201535,
    "name": "오니 가면",
    "armorType": "Head",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/9997. Garland of Petals.png"
  },
  {
    "code": 201701,
    "name": "핏빛 왕관",
    "armorType": "Head",
    "itemGrade": "Mythic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/9998. Harmony in Full Bloom.png"
  },
  {
    "code": 202101,
    "name": "바람막이",
    "armorType": "Chest",
    "itemGrade": "Common",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/01. Chest/002. Monk_s Robe.png"
  },
  {
    "code": 202103,
    "name": "승복",
    "armorType": "Chest",
    "itemGrade": "Common",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/01. Chest/003. Wetsuit.png"
  },
  {
    "code": 202104,
    "name": "백색가운",
    "armorType": "Chest",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/01. Chest/004. Shirt.png"
  },
  {
    "code": 202105,
    "name": "전신수영복",
    "armorType": "Chest",
    "itemGrade": "Common",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/01. Chest/005. Leather Armor.png"
  },
  {
    "code": 202106,
    "name": "셔츠",
    "armorType": "Chest",
    "itemGrade": "Common",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/01. Chest/006. Miltary Suit.png"
  },
  {
    "code": 202201,
    "name": "가죽갑옷",
    "armorType": "Chest",
    "itemGrade": "Uncommon",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/01. Chest/007. Patched Robe.png"
  },
  {
    "code": 202205,
    "name": "군복",
    "armorType": "Chest",
    "itemGrade": "Uncommon",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/01. Chest/008. Dress.png"
  },
  {
    "code": 202206,
    "name": "덧댄로브",
    "armorType": "Chest",
    "itemGrade": "Uncommon",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/01. Chest/009. Diving Suit.png"
  },
  {
    "code": 202207,
    "name": "드레스",
    "armorType": "Chest",
    "itemGrade": "Uncommon",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/01. Chest/010. Deacon Robes.png"
  },
  {
    "code": 202209,
    "name": "비키니",
    "armorType": "Chest",
    "itemGrade": "Mythic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/01. Chest/011. Rider Jacket.png"
  },
  {
    "code": 202210,
    "name": "잠수복",
    "armorType": "Chest",
    "itemGrade": "Uncommon",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/01. Chest/012. Chain Armor.png"
  },
  {
    "code": 202211,
    "name": "사제복",
    "armorType": "Chest",
    "itemGrade": "Uncommon",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/01. Chest/013. Suit.png"
  },
  {
    "code": 202301,
    "name": "라이더자켓",
    "armorType": "Chest",
    "itemGrade": "Rare",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/01. Chest/014. Qipao.png"
  },
  {
    "code": 202302,
    "name": "사슬갑옷",
    "armorType": "Chest",
    "itemGrade": "Rare",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/01. Chest/015. Hanbok.png"
  },
  {
    "code": 202303,
    "name": "정장",
    "armorType": "Chest",
    "itemGrade": "Rare",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/01. Chest/016. Bulletproof Vest.png"
  },
  {
    "code": 202304,
    "name": "치파오",
    "armorType": "Chest",
    "itemGrade": "Rare",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/01. Chest/017. Doctor_s Gown.png"
  },
  {
    "code": 202306,
    "name": "한복",
    "armorType": "Chest",
    "itemGrade": "Rare",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/01. Chest/018. Cardinal Robes.png"
  },
  {
    "code": 202307,
    "name": "고위사제복",
    "armorType": "Chest",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/01. Chest/019. Sunset Armor.png"
  },
  {
    "code": 202401,
    "name": "방탄조끼",
    "armorType": "Chest",
    "itemGrade": "Rare",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/01. Chest/020. Covert Agent Uniform.png"
  },
  {
    "code": 202402,
    "name": "석양의갑옷",
    "armorType": "Chest",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/01. Chest/021. Optical Camouflage Suit.png"
  },
  {
    "code": 202404,
    "name": "어사의",
    "armorType": "Chest",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/01. Chest/022. Rocker_s Jacket.png"
  },
  {
    "code": 202405,
    "name": "광학미채수트",
    "armorType": "Chest",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/01. Chest/023. Crusader Armor.png"
  },
  {
    "code": 202406,
    "name": "락커의자켓",
    "armorType": "Chest",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/01. Chest/024. Amazoness_Armor.png"
  },
  {
    "code": 202407,
    "name": "미스릴갑옷",
    "armorType": "Chest",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/01. Chest/025. Dragon Dobok.png"
  },
  {
    "code": 202408,
    "name": "성기사의갑옷",
    "armorType": "Chest",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/01. Chest/026. Commander_s Armor.png"
  },
  {
    "code": 202410,
    "name": "아마조네스아머",
    "armorType": "Chest",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/01. Chest/027. Butler_s Suit.png"
  },
  {
    "code": 202411,
    "name": "용의도복",
    "armorType": "Chest",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/01. Chest/028. EOD Suit.png"
  },
  {
    "code": 202412,
    "name": "지휘관의갑옷",
    "armorType": "Chest",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/01. Chest/029. Tuxedo.png"
  },
  {
    "code": 202413,
    "name": "집사복",
    "armorType": "Chest",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/01. Chest/030. High Priest Robes.png"
  },
  {
    "code": 202415,
    "name": "배틀수트",
    "armorType": "Chest",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/01. Chest/031. Changpao.png"
  },
  {
    "code": 202416,
    "name": "불꽃드레스",
    "armorType": "Chest",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/01. Chest/032. Turnout Coat.png"
  },
  {
    "code": 202417,
    "name": "EOD수트",
    "armorType": "Chest",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/01. Chest/033. Mithril Armor.png"
  },
  {
    "code": 202418,
    "name": "턱시도",
    "armorType": "Chest",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/01. Chest/034. Battle Suit.png"
  },
  {
    "code": 202419,
    "name": "제사장의예복",
    "armorType": "Chest",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/01. Chest/035. Blazing Dress.png"
  },
  {
    "code": 202420,
    "name": "창파오",
    "armorType": "Chest",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/01. Chest/036. Mithril Crop.png"
  },
  {
    "code": 202421,
    "name": "미스릴크롭",
    "armorType": "Chest",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/01. Chest/037. Kabana.png"
  },
  {
    "code": 202422,
    "name": "방화복",
    "armorType": "Chest",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/01. Chest/038. Holy Orders.png"
  },
  {
    "code": 202423,
    "name": "교복",
    "armorType": "Chest",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/01. Chest/039. Áo Dài.png"
  },
  {
    "code": 202501,
    "name": "카바나",
    "armorType": "Chest",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/01. Chest/040. Phantom Jacket.png"
  },
  {
    "code": 202502,
    "name": "퀸오브하트",
    "armorType": "Chest",
    "itemGrade": "Mythic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/01. Chest/041. Guardian Suit.png"
  },
  {
    "code": 202503,
    "name": "성법의",
    "armorType": "Chest",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/01. Chest/042. Elegant Gown.png"
  },
  {
    "code": 202504,
    "name": "버건디47",
    "armorType": "Chest",
    "itemGrade": "Mythic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/01. Chest/043. Beautiful Garnment.png"
  },
  {
    "code": 202505,
    "name": "아오자이",
    "armorType": "Chest",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/01. Chest/044. Specter.png"
  },
  {
    "code": 202506,
    "name": "팬텀자켓",
    "armorType": "Chest",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/01. Chest/045. Blood Cloak.png"
  },
  {
    "code": 202507,
    "name": "가디언슈트",
    "armorType": "Chest",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/01. Chest/046. Omertà.png"
  },
  {
    "code": 202508,
    "name": "진은드레스",
    "armorType": "Chest",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/01. Chest/047. Shooting Star Jacket.png"
  },
  {
    "code": 202509,
    "name": "선녀강림",
    "armorType": "Chest",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/01. Chest/048. Couturier.png"
  },
  {
    "code": 202510,
    "name": "고스트",
    "armorType": "Chest",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/01. Chest/049. Tactical Armor.png"
  },
  {
    "code": 202511,
    "name": "핏빛망토",
    "armorType": "Chest",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/01. Chest/050. Elf Dress.png"
  },
  {
    "code": 202512,
    "name": "오메르타",
    "armorType": "Chest",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/01. Chest/051. Titan Armor.png"
  },
  {
    "code": 202513,
    "name": "슈팅스타자켓",
    "armorType": "Chest",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/01. Chest/052. The Revenant.png"
  },
  {
    "code": 202514,
    "name": "쿠튀리에",
    "armorType": "Chest",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/01. Chest/053. Racing Suit.png"
  },
  {
    "code": 202515,
    "name": "택티컬아머",
    "armorType": "Chest",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/01. Chest/054. Ghost Bride_s Dress.png"
  },
  {
    "code": 202516,
    "name": "엘프드레스",
    "armorType": "Chest",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/01. Chest/055. Ghillie Suit.png"
  },
  {
    "code": 202517,
    "name": "타이탄아머",
    "armorType": "Chest",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/01. Chest/056. Spectral Jacket.png"
  },
  {
    "code": 202518,
    "name": "레버넌트",
    "armorType": "Chest",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/01. Chest/057. Wisdom Robes.png"
  },
  {
    "code": 202521,
    "name": "레이싱슈트",
    "armorType": "Chest",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/01. Chest/058. Inquisitor.png"
  },
  {
    "code": 202522,
    "name": "유령신부의드레스",
    "armorType": "Chest",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/01. Chest/059. The General_s Robe.png"
  },
  {
    "code": 202523,
    "name": "길리슈트",
    "armorType": "Chest",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/01. Chest/060. Red Star.png"
  },
  {
    "code": 202524,
    "name": "스펙터",
    "armorType": "Chest",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/01. Chest/061. Bikini.png"
  },
  {
    "code": 202525,
    "name": "현자의로브",
    "armorType": "Chest",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/01. Chest/062. Queen of Hearts.png"
  },
  {
    "code": 202526,
    "name": "이단심판관LUMIA",
    "armorType": "Chest",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/01. Chest/063. Burgundy 47.png"
  },
  {
    "code": 202527,
    "name": "흑염룡의갑옷",
    "armorType": "Chest",
    "itemGrade": "Mythic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/01. Chest/064. Black Flame Dragon.png"
  },
  {
    "code": 202528,
    "name": "페더폴",
    "armorType": "Head",
    "itemGrade": "Mythic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/02. Head/9999. Celestial Echo.png"
  },
  {
    "code": 202529,
    "name": "화령장",
    "armorType": "Chest",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": null
  },
  {
    "code": 202530,
    "name": "반역의의지",
    "armorType": "Chest",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": null
  },
  {
    "code": 203101,
    "name": "손목시계",
    "armorType": "Arm",
    "itemGrade": "Common",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/001. Watch.png"
  },
  {
    "code": 203102,
    "name": "붕대",
    "armorType": "Arm",
    "itemGrade": "Common",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/002. Bandage.png"
  },
  {
    "code": 203104,
    "name": "팔찌",
    "armorType": "Arm",
    "itemGrade": "Common",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/003. Bracelet.png"
  },
  {
    "code": 203201,
    "name": "가죽방패",
    "armorType": "Arm",
    "itemGrade": "Uncommon",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/004. Leather Shield.png"
  },
  {
    "code": 203202,
    "name": "분대장완장",
    "armorType": "Arm",
    "itemGrade": "Uncommon",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/005. Squad Leader Armband.png"
  },
  {
    "code": 203203,
    "name": "브레이서",
    "armorType": "Arm",
    "itemGrade": "Uncommon",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/006. Bracer.png"
  },
  {
    "code": 203204,
    "name": "고장난시계",
    "armorType": "Arm",
    "itemGrade": "Uncommon",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/007. Broken Watch.png"
  },
  {
    "code": 203301,
    "name": "검집",
    "armorType": "Arm",
    "itemGrade": "Rare",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/008. Box.png"
  },
  {
    "code": 203302,
    "name": "금팔찌",
    "armorType": "Arm",
    "itemGrade": "Rare",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/009. Sheath.png"
  },
  {
    "code": 203303,
    "name": "바주반드",
    "armorType": "Arm",
    "itemGrade": "Rare",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/010. Golden Bracelet.png"
  },
  {
    "code": 203304,
    "name": "진홍팔찌",
    "armorType": "Arm",
    "itemGrade": "Rare",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/011. Bazuband.png"
  },
  {
    "code": 203306,
    "name": "포이즌드",
    "armorType": "Arm",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/012. Crimson Bracelet.png"
  },
  {
    "code": 203402,
    "name": "소드스토퍼",
    "armorType": "Arm",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/013. Corrupting Touch.png"
  },
  {
    "code": 203403,
    "name": "드라우프니르",
    "armorType": "Arm",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/014. Sword Stopper.png"
  },
  {
    "code": 203404,
    "name": "미스릴방패",
    "armorType": "Arm",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/015. Draupnir.png"
  },
  {
    "code": 203405,
    "name": "바이탈센서",
    "armorType": "Arm",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/016. Vital Sign Censor.png"
  },
  {
    "code": 203406,
    "name": "기사의신조",
    "armorType": "Arm",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/017. Creed of the Knight.png"
  },
  {
    "code": 203407,
    "name": "샤자한의검집",
    "armorType": "Arm",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/018. Sheath of Shah Jahan.png"
  },
  {
    "code": 203408,
    "name": "큐브워치",
    "armorType": "Arm",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/019. Burnished Aegis.png"
  },
  {
    "code": 203409,
    "name": "아이기스",
    "armorType": "Arm",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/020. Tindalos Band.png"
  },
  {
    "code": 203410,
    "name": "틴달로스의팔찌",
    "armorType": "Arm",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/021. Nightingale.png"
  },
  {
    "code": 203411,
    "name": "나이팅게일",
    "armorType": "Arm",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/022. Plasma Arc.png"
  },
  {
    "code": 203412,
    "name": "플라즈마아크",
    "armorType": "Arm",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/023. Smart Band.png"
  },
  {
    "code": 203413,
    "name": "텔루리안타임피스",
    "armorType": "Arm",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/024. Minuteman Armband.png"
  },
  {
    "code": 203414,
    "name": "스마트밴드",
    "armorType": "Arm",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/025. Sports Watch.png"
  },
  {
    "code": 203415,
    "name": "미닛맨의표식",
    "armorType": "Arm",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/026. White Crane Fan.png"
  },
  {
    "code": 203501,
    "name": "스카디의팔찌",
    "armorType": "Arm",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/027. Laced Quiver.png"
  },
  {
    "code": 203502,
    "name": "레이더",
    "armorType": "Arm",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/028. Jolly Roger.png"
  },
  {
    "code": 203503,
    "name": "오토암즈",
    "armorType": "Arm",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/029. Music Box.png"
  },
  {
    "code": 203504,
    "name": "프로미넌스",
    "armorType": "Arm",
    "itemGrade": "Mythic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/030. Schrödinger_s Box.png"
  },
  {
    "code": 203505,
    "name": "가시지네견갑",
    "armorType": "Arm",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/031. Veritas Lux Mea.png"
  },
  {
    "code": 203506,
    "name": "스포츠시계",
    "armorType": "Arm",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/032. Mithril Shield.png"
  },
  {
    "code": 203507,
    "name": "틴달로스의군주",
    "armorType": "Arm",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/033. Cube Watch.png"
  },
  {
    "code": 203508,
    "name": "샤를마뉴의방패",
    "armorType": "Arm",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/034. Tellurian Timepiece.png"
  },
  {
    "code": 203509,
    "name": "혈사조",
    "armorType": "Arm",
    "itemGrade": "Mythic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/035. Bracelet of Skadi.png"
  },
  {
    "code": 203510,
    "name": "용의비늘",
    "armorType": "Arm",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/036. Radar.png"
  },
  {
    "code": 203511,
    "name": "서슬가시체인",
    "armorType": "Arm",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/037. Auto-arms.png"
  },
  {
    "code": 203512,
    "name": "아흐라만의손길",
    "armorType": "Arm",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/038. Centipede_s Pauldron.png"
  },
  {
    "code": 203513,
    "name": "헬릭스",
    "armorType": "Arm",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/039. Tindalos Monarch.png"
  },
  {
    "code": 203514,
    "name": "미스릴완장",
    "armorType": "Arm",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/040. Shield of Kings.png"
  },
  {
    "code": 203515,
    "name": "노바실드",
    "armorType": "Arm",
    "itemGrade": "Mythic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/041. Dragon Scale.png"
  },
  {
    "code": 203516,
    "name": "파프니르",
    "armorType": "Arm",
    "itemGrade": "Mythic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/042. Chain of Thorns.png"
  },
  {
    "code": 204101,
    "name": "슬리퍼",
    "armorType": "Leg",
    "itemGrade": "Common",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/04. Leg/001. Slipper.png"
  },
  {
    "code": 204102,
    "name": "운동화",
    "armorType": "Leg",
    "itemGrade": "Common",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/04. Leg/002. Running Shoes.png"
  },
  {
    "code": 204103,
    "name": "타이즈",
    "armorType": "Leg",
    "itemGrade": "Common",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/04. Leg/003. Tights.png"
  },
  {
    "code": 204201,
    "name": "무릎보호대",
    "armorType": "Leg",
    "itemGrade": "Rare",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/04. Leg/004. Clogs.png"
  },
  {
    "code": 204202,
    "name": "체인레깅스",
    "armorType": "Leg",
    "itemGrade": "Uncommon",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/04. Leg/005. Chain Leggings.png"
  },
  {
    "code": 204203,
    "name": "하이힐",
    "armorType": "Leg",
    "itemGrade": "Uncommon",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/04. Leg/006. High Heels.png"
  },
  {
    "code": 204204,
    "name": "힐리스",
    "armorType": "Leg",
    "itemGrade": "Uncommon",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/04. Leg/007. Heelys.png"
  },
  {
    "code": 204205,
    "name": "나막신",
    "armorType": "Leg",
    "itemGrade": "Common",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/04. Leg/008. Repaired Slippers.png"
  },
  {
    "code": 204301,
    "name": "덧댄슬리퍼",
    "armorType": "Leg",
    "itemGrade": "Uncommon",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/04. Leg/009. Boots.png"
  },
  {
    "code": 204302,
    "name": "부츠",
    "armorType": "Leg",
    "itemGrade": "Uncommon",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/04. Leg/010. Knee Pads.png"
  },
  {
    "code": 204303,
    "name": "등산화",
    "armorType": "Leg",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/04. Leg/011. Combat Boots.png"
  },
  {
    "code": 204304,
    "name": "아이젠",
    "armorType": "Leg",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/04. Leg/012. Hiking Boots.png"
  },
  {
    "code": 204401,
    "name": "강철무릎보호대",
    "armorType": "Leg",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/04. Leg/013. Glacier Crampons.png"
  },
  {
    "code": 204402,
    "name": "경량화부츠",
    "armorType": "Leg",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/04. Leg/014. Steel Knee Pads.png"
  },
  {
    "code": 204403,
    "name": "매버릭러너",
    "armorType": "Leg",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/04. Leg/015. Feather Boots.png"
  },
  {
    "code": 204404,
    "name": "전투화",
    "armorType": "Leg",
    "itemGrade": "Rare",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/04. Leg/016. Maverick Runner.png"
  },
  {
    "code": 204405,
    "name": "킬힐",
    "armorType": "Leg",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/04. Leg/017. Straitjacket Sneakers.png"
  },
  {
    "code": 204406,
    "name": "풍화륜",
    "armorType": "Leg",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/04. Leg/018. Bucephalus.png"
  },
  {
    "code": 204407,
    "name": "미스릴부츠",
    "armorType": "Leg",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/04. Leg/019. White Rhinos.png"
  },
  {
    "code": 204408,
    "name": "부케팔로스",
    "armorType": "Leg",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/04. Leg/020. Tachyon Brace.png"
  },
  {
    "code": 204409,
    "name": "EOD부츠",
    "armorType": "Leg",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/04. Leg/021. SCV (Self-Controlled Vehicle).png"
  },
  {
    "code": 204410,
    "name": "글레이셜슈즈",
    "armorType": "Leg",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/04. Leg/022. Stellar Steps.png"
  },
  {
    "code": 204411,
    "name": "클링온부츠",
    "armorType": "Leg",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/04. Leg/023. Cowboy Boots.png"
  },
  {
    "code": 204412,
    "name": "타키온브레이스",
    "armorType": "Leg",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/04. Leg/024. Gladiator.png"
  },
  {
    "code": 204413,
    "name": "탭루트",
    "armorType": "Leg",
    "itemGrade": "Mythic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/04. Leg/025. Delta Red.png"
  },
  {
    "code": 204414,
    "name": "아이언메이든",
    "armorType": "Leg",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/04. Leg/026. Killer Heels.png"
  },
  {
    "code": 204415,
    "name": "SCV",
    "armorType": "Leg",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/04. Leg/027. Mithril Boots.png"
  },
  {
    "code": 204416,
    "name": "스텔라스텝",
    "armorType": "Leg",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/04. Leg/028. EOD Boots_EOD 부츠.png"
  },
  {
    "code": 204417,
    "name": "카우보이부츠",
    "armorType": "Leg",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/04. Leg/029. Glacial Shoes.png"
  },
  {
    "code": 204418,
    "name": "글레디에이터",
    "armorType": "Leg",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/04. Leg/030. Iron Maiden.png"
  },
  {
    "code": 204419,
    "name": "델타레드",
    "armorType": "Leg",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/04. Leg/031. Red Shoes.png"
  },
  {
    "code": 204501,
    "name": "헤르메스의부츠",
    "armorType": "Leg",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/04. Leg/031. Boots of Hermes.png"
  },
  {
    "code": 204502,
    "name": "분홍신",
    "armorType": "Leg",
    "itemGrade": "Mythic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/04. Leg/032. Eldian Boots.png"
  },
  {
    "code": 204503,
    "name": "블레이드부츠",
    "armorType": "Leg",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/04. Leg/032. Blade Boots.png"
  },
  {
    "code": 204504,
    "name": "알렉산드로스",
    "armorType": "Leg",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/04. Leg/033. Alexander.png"
  },
  {
    "code": 204505,
    "name": "칼날다리",
    "armorType": "Leg",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/04. Leg/033. Rose Steps.png"
  },
  {
    "code": 204506,
    "name": "와일드워커",
    "armorType": "Leg",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/04. Leg/034. Legs of Steel.png"
  },
  {
    "code": 204507,
    "name": "갤럭시 스텝",
    "armorType": "Leg",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/04. Leg/034. Pixie Boots.png"
  },
  {
    "code": 204508,
    "name": "미라지 워커",
    "armorType": "Leg",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/04. Leg/035. Wild Walkers.png"
  },
  {
    "code": 204509,
    "name": "레이싱부츠",
    "armorType": "Leg",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/04. Leg/036. Galaxy Steps.png"
  },
  {
    "code": 204510,
    "name": "엘디안부츠",
    "armorType": "Leg",
    "itemGrade": "Mythic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/04. Leg/037. Mirage Lace-Ups.png"
  },
  {
    "code": 204511,
    "name": "로즈 스텝",
    "armorType": "Leg",
    "itemGrade": "Mythic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/04. Leg/038. Racing Boots.png"
  },
  {
    "code": 204512,
    "name": "스페이스 부츠",
    "armorType": "Leg",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/04. Leg/039. Space Boots.png"
  },
  {
    "code": 204513,
    "name": "픽시 부츠",
    "armorType": "Leg",
    "itemGrade": "Mythic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/04. Leg/040. Taproot.png"
  },
  {
    "code": 204514,
    "name": "택티컬 슈즈",
    "armorType": "Leg",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": null
  },
  {
    "code": 205107,
    "name": "상자",
    "armorType": "Arm",
    "itemGrade": "Uncommon",
    "isCompletedItem": false,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/043. Nightmare Nails.png"
  },
  {
    "code": 205201,
    "name": "백우선",
    "armorType": "Arm",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/044. Helix.png"
  },
  {
    "code": 205304,
    "name": "궁기병의화살통",
    "armorType": "Arm",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/045. Mythril Armband.png"
  },
  {
    "code": 205306,
    "name": "해적의 증표",
    "armorType": "Arm",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/046. Buccaneer Doubloon.png"
  },
  {
    "code": 205308,
    "name": "해적 깃발",
    "armorType": "Arm",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/047. Moonlight Pendant.png"
  },
  {
    "code": 205309,
    "name": "오르골",
    "armorType": "Arm",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/048. Lunar Embrace.png"
  },
  {
    "code": 205401,
    "name": "달빛팬던트",
    "armorType": "Arm",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/049. Mythril Quiver.png"
  },
  {
    "code": 205404,
    "name": "슈뢰딩거의상자",
    "armorType": "Arm",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/050. Sultan Adorned.png"
  },
  {
    "code": 205405,
    "name": "진리는 나의 빛",
    "armorType": "Arm",
    "itemGrade": "Epic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/051. Dice of Destiny.png"
  },
  {
    "code": 205406,
    "name": "요명월",
    "armorType": "Arm",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/052. Sanguine Gunbai.png"
  },
  {
    "code": 205407,
    "name": "미스릴퀴버",
    "armorType": "Arm",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/053. Totem.png"
  },
  {
    "code": 205408,
    "name": "살라딘의화살통",
    "armorType": "Arm",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/054. Eye of Horus.png"
  },
  {
    "code": 205501,
    "name": "운명의주사위",
    "armorType": "Arm",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/055. Emerald Tablet.png"
  },
  {
    "code": 205502,
    "name": "파초선",
    "armorType": "Arm",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/056. Magic Lamp.png"
  },
  {
    "code": 205503,
    "name": "쿤달라",
    "armorType": "Head",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": null
  },
  {
    "code": 205504,
    "name": "오르비스",
    "armorType": "Arm",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/057. Solar System Miniature.png"
  },
  {
    "code": 205505,
    "name": "호루스의눈",
    "armorType": "Arm",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/058. Burning Heart.png"
  },
  {
    "code": 205507,
    "name": "네크로노미콘",
    "armorType": "Arm",
    "itemGrade": "Mythic",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/059. Claddagh Ring.png"
  },
  {
    "code": 205508,
    "name": "에메랄드타블렛",
    "armorType": "Arm",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/060. Smash Totem.png"
  },
  {
    "code": 205601,
    "name": "요술램프",
    "armorType": "Arm",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/061. Pharaoh_s Artifact.png"
  },
  {
    "code": 701451,
    "name": "택티컬바이저",
    "armorType": "Head",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": null
  },
  {
    "code": 705601,
    "name": "미니어쳐솔라시스템",
    "armorType": "Arm",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/062. Psyche_s Blade.png"
  },
  {
    "code": 705603,
    "name": "하트온파이어",
    "armorType": "Arm",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/063. Prominence.png"
  },
  {
    "code": 705604,
    "name": "클라다 반지",
    "armorType": "Arm",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/064. Bloodripper.png"
  },
  {
    "code": 705607,
    "name": "토템",
    "armorType": "Arm",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/065. Nova Shield.png"
  },
  {
    "code": 705608,
    "name": "임세티",
    "armorType": "Arm",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/066. Fáfnir.png"
  },
  {
    "code": 705614,
    "name": "프시케의 칼날",
    "armorType": "Arm",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": "/images/Item/02. Armor/03. Arm, Accessory/067. Necronomicon.png"
  },
  {
    "code": 705620,
    "name": "천룡잠",
    "armorType": "Head",
    "itemGrade": "Legend",
    "isCompletedItem": true,
    "imagePath": null
  }
];

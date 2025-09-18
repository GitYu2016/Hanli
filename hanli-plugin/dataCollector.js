// JSON数据采集模块
class DataCollector {
    constructor() {
        this.rawData = null;
    }

    // 采集原始数据
    async scrapeRawData() {
        // 找到包含 window.rawData 的 <script>
        let scripts = Array.from(document.querySelectorAll("script"));
        let rawScript = scripts.find(s => s.textContent.includes("window.rawData"));
        if (!rawScript) {
            alert("未找到 window.rawData");
            return null;
        }

        // 正则提取 JSON 字符串
        let match = rawScript.textContent.match(/window\.rawData\s*=\s*(\{.*?\});/s);
        if (!match) {
            alert("无法解析 window.rawData");
            return null;
        }

        let jsonStr = match[1];
        let rawData;
        try {
            rawData = JSON.parse(jsonStr);
            this.rawData = rawData;
        } catch (e) {
            alert("JSON解析失败: " + e.message);
            return null;
        }

        return rawData;
    }

    // 处理商品信息数据
    processGoodsInfoData(rawData) {
        if (!rawData) return null;

        // 取出标题和价格（根据 Temu rawData 结构调整字段）
        let goodsId = rawData?.store?.goodsId || "";
        
        // 遍历 crumbOptList
        let crumbOptList = rawData?.store?.crumbOptList || [];
        let goodsCat1 = ''
        if (crumbOptList.length > 1) {
            goodsCat1 = crumbOptList[1].optName
        }
        let goodsCat2 = ''
        if (crumbOptList.length > 2) {
            goodsCat2 = crumbOptList[2].optName
        }

        let goodsTitleCn = rawData?.store?.goods?.goodsName || "";
        let itemId = rawData?.store?.goods?.itemId || "";
        let goodsCat3 = goodsTitleCn
        let goodsSold = rawData?.store?.goods?.sideSalesTip || "";
        let goodsPropertys = rawData?.store?.goods?.goodsProperty || [];
        let skuInfoList = rawData?.store?.sku || [];
        let skuList = [];
        
        for (let sku of skuInfoList) {
            let specs = sku?.specs || [];
            let skuName = this.joinObjectField(specs, 'specValue', '|');

            skuList.push({
                skuId: sku.skuId,
                skuName: skuName,
                skuPic: sku.thumbUrl,
                goodsPromoPrice: sku.normalPriceStr,
                goodsNormalPrice: sku.normalLinePriceStr
            });
        }

        // 获取商品主图片 - 尝试多种可能的字段名
        let mainImages = rawData?.store?.goods?.mainImages || 
                        rawData?.store?.goods?.images || 
                        rawData?.store?.goods?.imageList || 
                        [];
        
        console.log('原始主图片数据:', rawData?.store?.goods?.mainImages);
        console.log('备用图片字段1:', rawData?.store?.goods?.images);
        console.log('备用图片字段2:', rawData?.store?.goods?.imageList);
        
        // 添加SKU图片
        let allImages = [...mainImages];
        skuList.forEach(sku => {
            if (sku.skuPic) {
                allImages.push(sku.skuPic);
            }
        });
        
        // 尝试从其他可能的位置获取图片
        // 检查是否有其他图片字段
        if (rawData?.store?.goods) {
            Object.keys(rawData.store.goods).forEach(key => {
                if (key.toLowerCase().includes('image') || key.toLowerCase().includes('pic')) {
                    console.log(`发现可能的图片字段 ${key}:`, rawData.store.goods[key]);
                }
            });
        }

        // 生成当前时间戳（YYYYMMDDHHMM格式）
        const now = new Date();
        const collectTime = now.getFullYear().toString() +
            (now.getMonth() + 1).toString().padStart(2, '0') +
            now.getDate().toString().padStart(2, '0') +
            now.getHours().toString().padStart(2, '0') +
            now.getMinutes().toString().padStart(2, '0');

        // 处理商品属性
        let goodsPropertyInfo = {};
        for (let goodsProperty of goodsPropertys) {
            let goodsDescKey = goodsProperty?.["key"] || '';
            let goodsDescValues = (goodsProperty?.["values"] || []).join('|');
            goodsPropertyInfo[goodsDescKey] = goodsDescValues
        }

        return {
            goodsId,
            itemId,
            goodsCat1,
            goodsCat2,
            goodsCat3,
            goodsTitleEn,
            goodsTitleCn: "", // 留空，支持用户编辑
            skuList,
            goodsPropertyInfo,
            collectTime,
            collectUrl: window.location.href, // 添加采集链接
            allImages // 返回所有图片URL，供图片采集模块处理
        };
    }

    // 处理监控数据
    processMonitoringData(rawData) {
        if (!rawData) return null;

        let goodsId = rawData?.store?.goodsId || "";
        let goodsSold = rawData?.store?.goods?.sideSalesTip || "";
        let goodsCat1 = '';
        let goodsCat2 = '';
        let goodsCat3 = '';
        
        // 处理分类信息
        let crumbOptList = rawData?.store?.crumbOptList || [];
        if (crumbOptList.length > 1) {
            goodsCat1 = crumbOptList[1].optName
        }
        if (crumbOptList.length > 2) {
            goodsCat2 = crumbOptList[2].optName
        }
        goodsCat3 = rawData?.store?.goods?.goodsName || "";

        // 处理SKU信息
        let skuInfoList = rawData?.store?.sku || [];
        let skuList = [];
        for (let sku of skuInfoList) {
            let specs = sku?.specs || [];
            let skuName = this.joinObjectField(specs, 'specValue', '|');

            skuList.push({
                skuId: sku.skuId,
                skuName: skuName,
                skuPic: sku.thumbUrl,
                goodsPromoPrice: sku.normalPriceStr
            });
        }

        // 处理店铺数据
        let mallData = rawData?.store?.moduleMap?.mallModule?.data?.mallData || {};
        let storeId = mallData?.mallId || '';
        let storeName = mallData?.mallName || '';
        let storeRating = mallData?.mallStar || '';
        let storeSold = (mallData?.goodsSalesNumUnit || []).join(' ');
        let storeFollowers = (mallData?.followerNumUnit || []).join(' ');
        let storeltemsNum = (mallData?.goodsNumUnit || []).join(' ');
        let storeStartYear = this.joinObjectField((mallData?.mallTags || []), 'text', '|');
        let storeUrl = rawData?.store?.mallUrl || window.location.origin;

        // 生成当前时间戳（东八区ISO格式）
        const now = new Date();
        const collectTime = now.toLocaleString('sv-SE', { 
            timeZone: 'Asia/Shanghai' 
        }).replace(' ', 'T');

        return {
            goodsId,
            listingDate: "", // 留空
            collectTime,
            goodsSold,
            goodsCat1,
            goodsCat2,
            goodsCat3,
            skuList: skuList.map(sku => ({
                skuId: sku.skuId,
                skuName: sku.skuName,
                skuPic: sku.skuPic,
                goodsPromoPrice: sku.goodsPromoPrice
            })),
            storeId,
            storeName,
            storeStartYear,
            collectTime,
            storeUrl,
            storeData: {
                storeSold,
                storeFollowers,
                storeltemsNum,
                storeRating
            }
        };
    }

    // 工具函数：连接对象字段
    joinObjectField(list, key = "specValue", separator = "") {
        if (!Array.isArray(list)) {
            console.error("入参必须是对象数组");
            return "";
        }
        return list
            .map(item => item?.[key]) // 取字段
            .filter(v => v)           // 过滤掉 undefined / null / 空字符串
            .join(separator);
    }

    // 获取原始数据
    getRawData() {
        return this.rawData;
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataCollector;
} else {
    window.DataCollector = DataCollector;
}

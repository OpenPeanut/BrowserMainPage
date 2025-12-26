function getSiteContent(name,link,icon) {
	if (icon != null) {
		return "<div class=\"c-span3 c-gap-left-large nav-item\"><a class=\"border-for-item\" href=\""+link+"\" target=\"_blank\"><div class=\"nav-icon\"><img height=\"32px\" src=\""+icon+"\" width=\"32px\"></img></div><div class=\"c-gap-left-small nav-text\">"+name+"</div></a></div>"
	}else{
		return "<div class=\"c-span3 c-gap-left-large nav-item\"><a class=\"border-for-item\" href=\""+link+"\" target=\"_blank\"><div class=\"nav-icon-normal\">"+name.substring(0,1)+"</div><div class=\"c-gap-left-small nav-text\">"+name+"</div></a></div>"
	}
}

var panel = $("#sites_panel");
console.log(panel.text());
panel.append(getSiteContent("Github","https://github.com/","favicons/github.png"));
panel.append(getSiteContent("小破站","https://www.bilibili.com/","favicons/bilibili.png"));
panel.append(getSiteContent("字幕库","http://zimuku.org/"));
panel.append(getSiteContent("在线正则","https://regex101.com/","favicons/regex101.ico"));
panel.append(getSiteContent("俄区正版游戏","https://byrut.org/index.php?do=","favicons/byrut.png"));
panel.append(getSiteContent("飞书项目","https://project.feishu.cn/"));
panel.append(getSiteContent("GitLab","https://git.17zjh.com/", "favicons/gitlab.png"));
panel.append(getSiteContent("Firebase","https://console.firebase.google.com/project/weplay-1615777951368/overview?hl=zh-cn", "favicons/firebase_28dp.png"));
panel.append(getSiteContent("Google Pay","https://play.google.com/console/u/0/developers/5129658753235517501/app-list", "favicons/google.ico"));
panel.append(getSiteContent("微派图床","https://config-admin.weplayapp.com/global/tools/compression", "favicons/wepie.ico"));
panel.append(getSiteContent("TinyPNG","https://tinify.cn/", "favicons/tinypng.ico"));
panel.append(getSiteContent("飞书文档","https://wepie.feishu.cn/wiki/"));

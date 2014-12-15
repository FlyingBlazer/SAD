-- phpMyAdmin SQL Dump
-- version 3.4.10.1
-- http://www.phpmyadmin.net
--
-- 主机: localhost
-- 生成日期: 2014 年 12 月 15 日 09:05
-- 服务器版本: 5.5.20
-- PHP 版本: 5.3.10

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- 数据库: `sad`
--
CREATE DATABASE `sad` DEFAULT CHARACTER SET utf8 COLLATE utf8_bin;
USE `sad`;

-- --------------------------------------------------------

--
-- 表的结构 `administrator`
--

CREATE TABLE IF NOT EXISTS `administrator` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `pass` varchar(50) COLLATE utf8_bin NOT NULL,
  `auth` bit(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `administrator_name` (`name`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_bin AUTO_INCREMENT=5 ;

--
-- 转存表中的数据 `administrator`
--

INSERT INTO `administrator` (`id`, `name`, `pass`, `auth`) VALUES
(1, 'sabbyszm001', '8b6a93fbde09e3b50f675261f01c4648', b'0'),
(2, 'sabbyszm002', 'dd93dd8a9dcb3e29c685806c5ffcd67b', b'0'),
(3, 'sabbyszm003', 'f119097d137d58efe492d77a39376380', b'0'),
(4, 'sabbyszm004', 'ed9c53a561e699e2e8a841247fbd8d1a', b'0');

-- --------------------------------------------------------

--
-- 表的结构 `appointment`
--

CREATE TABLE IF NOT EXISTS `appointment` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `doctor_id` int(11) NOT NULL,
  `pay_method` int(11) NOT NULL,
  `time` date NOT NULL,
  `period` tinyint(1) NOT NULL,
  `status` int(11) NOT NULL,
  `price` decimal(8,2) NOT NULL,
  `running_number` varchar(50) COLLATE utf8_bin NOT NULL,
  `record_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `running_number` (`running_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- 表的结构 `department`
--

CREATE TABLE IF NOT EXISTS `department` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `hospital_id` int(11) NOT NULL,
  `name` varchar(50) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `info` text COLLATE utf8_bin NOT NULL,
  `tel` varchar(50) COLLATE utf8_bin NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- 表的结构 `doctor`
--

CREATE TABLE IF NOT EXISTS `doctor` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `department_id` int(11) NOT NULL,
  `name` varchar(20) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `photo` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  `info` text COLLATE utf8_bin NOT NULL,
  `title` varchar(50) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `price` decimal(8,2) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `doctor_photo` (`photo`),
  FULLTEXT KEY `name` (`name`),
  FULLTEXT KEY `info` (`info`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_bin AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- 表的结构 `hospital`
--

CREATE TABLE IF NOT EXISTS `hospital` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `rating_id` int(11) NOT NULL,
  `name` varchar(50) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `province` varchar(20) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `city` varchar(20) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `addr` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `tel` varchar(50) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `info` text COLLATE utf8_bin NOT NULL,
  `site` varchar(200) COLLATE utf8_bin DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  FULLTEXT KEY `info` (`info`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_bin AUTO_INCREMENT=51 ;

--
-- 转存表中的数据 `hospital`
--

INSERT INTO `hospital` (`id`, `rating_id`, `name`, `province`, `city`, `addr`, `tel`, `info`, `site`) VALUES
(1, 8, '中国人民解放军总医院301医院', '北京', '北京', '北京市海淀区复兴路28号', '无', '中国人民解放军总医院301医院是一所致力于救死扶伤的知名医疗机构，位于北京市海淀区复兴路28号。医院拥有全国一流的医疗团队，自建院时起至今......', 'http://jiaowu.buaa.edu.cn'),
(2, 8, '北京同仁医院', '北京', '北京', '北京市东城区东交民巷1号', '010-58266699', '北京同仁医院是一所致力于救死扶伤的知名医疗机构，位于北京市东城区东交民巷1号。医院拥有全国一流的医疗团队，自建院时起至今......', 'http://jiaowu.buaa.edu.cn'),
(3, 8, '北京天坛医院特需门诊', '北京', '北京', '北京市东城区天坛西里6号', '010-67096611', '北京天坛医院特需门诊是一所致力于救死扶伤的知名医疗机构，位于北京市东城区天坛西里6号。医院拥有全国一流的医疗团队，自建院时起至今......', 'http://jiaowu.buaa.edu.cn'),
(4, 8, '北京安贞医院小儿心脏中心', '北京', '北京', '安贞路2号', '010-64456534', '北京安贞医院小儿心脏中心是一所致力于救死扶伤的知名医疗机构，位于安贞路2号。医院拥有全国一流的医疗团队，自建院时起至今......', 'http://jiaowu.buaa.edu.cn'),
(5, 8, '北京中医药大学东直门医院国际部', '北京', '北京', '北京市东四北大街279号', '010-84012662', '北京中医药大学东直门医院国际部是一所致力于救死扶伤的知名医疗机构，位于北京市东四北大街279号。医院拥有全国一流的医疗团队，自建院时起至今......', 'http://jiaowu.buaa.edu.cn'),
(6, 8, '中国人民解放军总医院第一附属医院', '北京', '北京', '北京市海淀区阜城路51号', '010-66867304', '中国人民解放军总医院第一附属医院是一所致力于救死扶伤的知名医疗机构，位于北京市海淀区阜城路51号。医院拥有全国一流的医疗团队，自建院时起至今......', 'http://jiaowu.buaa.edu.cn'),
(7, 8, '中国人民武装警察部队北京市总队医院', '北京', '北京', '北京市朝阳区东三里屯一号', '010-64177199,010-51658777', '中国人民武装警察部队北京市总队医院是一所致力于救死扶伤的知名医疗机构，位于北京市朝阳区东三里屯一号。医院拥有全国一流的医疗团队，自建院时起至今......', 'http://jiaowu.buaa.edu.cn'),
(8, 8, '解放军第307医院', '北京', '北京', '北京市丰台区东大街8号', '010-66947114；4000100307', '解放军第307医院是一所致力于救死扶伤的知名医疗机构，位于北京市丰台区东大街8号。医院拥有全国一流的医疗团队，自建院时起至今......', 'http://jiaowu.buaa.edu.cn'),
(9, 8, '上海瑞金医院', '上海', '上海', '上海市黄浦区瑞金二路197号', '021-64370045', '上海瑞金医院是一所致力于救死扶伤的知名医疗机构，位于上海市黄浦区瑞金二路197号。医院拥有全国一流的医疗团队，自建院时起至今......', 'http://jiaowu.buaa.edu.cn'),
(10, 8, '复旦大学附属华山医院', '上海', '上海', '上海市静安区乌鲁木齐中路12号               附近', '021-52889999', '复旦大学附属华山医院是一所致力于救死扶伤的知名医疗机构，位于上海市静安区乌鲁木齐中路12号               附近。医院拥有全国一流的医疗团队，自建院时起至今......', 'http://jiaowu.buaa.edu.cn'),
(11, 8, '上海中山医院', '上海', '上海', '上海市徐汇区枫林路180号               附近', '021-64041990', '上海中山医院是一所致力于救死扶伤的知名医疗机构，位于上海市徐汇区枫林路180号               附近。医院拥有全国一流的医疗团队，自建院时起至今......', 'http://jiaowu.buaa.edu.cn'),
(12, 8, '上海国际医学中心', '上海', '上海', '上海市浦东新区康新公路4358号', '021-60236000', '上海国际医学中心是一所致力于救死扶伤的知名医疗机构，位于上海市浦东新区康新公路4358号。医院拥有全国一流的医疗团队，自建院时起至今......', 'http://jiaowu.buaa.edu.cn'),
(13, 8, '复旦大学附属中山医院特需门诊部', '上海', '上海', '上海市徐汇区医学院路111号B楼14-15层', '021-64041990', '复旦大学附属中山医院特需门诊部是一所致力于救死扶伤的知名医疗机构，位于上海市徐汇区医学院路111号B楼14-15层。医院拥有全国一流的医疗团队，自建院时起至今......', 'http://jiaowu.buaa.edu.cn'),
(14, 8, '上海长海医院', '上海', '上海', '上海市杨浦区长海路168号', '021-31166666', '上海长海医院是一所致力于救死扶伤的知名医疗机构，位于上海市杨浦区长海路168号。医院拥有全国一流的医疗团队，自建院时起至今......', 'http://jiaowu.buaa.edu.cn'),
(15, 8, '复旦大学附属肿瘤医院', '上海', '上海', '上海市徐汇区东安路270号               附近', '021-64175590', '复旦大学附属肿瘤医院是一所致力于救死扶伤的知名医疗机构，位于上海市徐汇区东安路270号               附近。医院拥有全国一流的医疗团队，自建院时起至今......', 'http://jiaowu.buaa.edu.cn'),
(16, 8, '上海华山医院东院', '上海', '上海', '上海市浦东新区红枫路525号', '021-38719999', '上海华山医院东院是一所致力于救死扶伤的知名医疗机构，位于上海市浦东新区红枫路525号。医院拥有全国一流的医疗团队，自建院时起至今......', 'http://jiaowu.buaa.edu.cn'),
(17, 8, '复旦大学附属华山医院北院', '上海', '上海', '上海市宝山区陆翔路108号', '021-66895999', '复旦大学附属华山医院北院是一所致力于救死扶伤的知名医疗机构，位于上海市宝山区陆翔路108号。医院拥有全国一流的医疗团队，自建院时起至今......', 'http://jiaowu.buaa.edu.cn'),
(18, 8, '上海第六人民医院', '上海', '上海', '上海市徐汇区宜山路600号', '021-64369181', '上海第六人民医院是一所致力于救死扶伤的知名医疗机构，位于上海市徐汇区宜山路600号。医院拥有全国一流的医疗团队，自建院时起至今......', 'http://jiaowu.buaa.edu.cn'),
(19, 8, '天津市肿瘤医院', '天津', '天津', '天津市河西区体院北环湖西路', '022-23340123,8008180388', '天津市肿瘤医院是一所致力于救死扶伤的知名医疗机构，位于天津市河西区体院北环湖西路。医院拥有全国一流的医疗团队，自建院时起至今......', 'http://jiaowu.buaa.edu.cn'),
(20, 8, '天津市环湖医院', '天津', '天津', '天津市河西区气象台路122号', '022-60367500；022-60367999', '天津市环湖医院是一所致力于救死扶伤的知名医疗机构，位于天津市河西区气象台路122号。医院拥有全国一流的医疗团队，自建院时起至今......', 'http://jiaowu.buaa.edu.cn'),
(21, 8, '武警后勤学院附属医...警医学院附属医院）', '天津', '天津', '天津市河东区成林道220号', '022-60578778', '武警后勤学院附属医...警医学院附属医院）是一所致力于救死扶伤的知名医疗机构，位于天津市河东区成林道220号。医院拥有全国一流的医疗团队，自建院时起至今......', 'http://jiaowu.buaa.edu.cn'),
(22, 9, '天津市宝坻区人民医院', '天津', '天津', '天津市宝坻区城关镇广川路8号', '022-29241553', '天津市宝坻区人民医院是一所致力于救死扶伤的知名医疗机构，位于天津市宝坻区城关镇广川路8号。医院拥有全国一流的医疗团队，自建院时起至今......', 'http://jiaowu.buaa.edu.cn'),
(23, 8, '天津市整形外科医院', '天津', '天津', '天津市和平区大沽路75号', '022-27125033， 022-2712813...', '天津市整形外科医院是一所致力于救死扶伤的知名医疗机构，位于天津市和平区大沽路75号。医院拥有全国一流的医疗团队，自建院时起至今......', 'http://jiaowu.buaa.edu.cn'),
(24, 9, '天津市安定医院', '天津', '天津', '天津市河西区柳林路13号', '022-88188188', '天津市安定医院是一所致力于救死扶伤的知名医疗机构，位于天津市河西区柳林路13号。医院拥有全国一流的医疗团队，自建院时起至今......', 'http://jiaowu.buaa.edu.cn'),
(25, 9, '天津市静海县医院', '天津', '天津', '天津市静海县胜利南路14号', '022-28942928', '天津市静海县医院是一所致力于救死扶伤的知名医疗机构，位于天津市静海县胜利南路14号。医院拥有全国一流的医疗团队，自建院时起至今......', 'http://jiaowu.buaa.edu.cn'),
(26, 4, '中国人民解放军第二七二医院', '天津', '天津', '天津市和平区多伦道185号', '4000223272', '中国人民解放军第二七二医院是一所致力于救死扶伤的知名医疗机构，位于天津市和平区多伦道185号。医院拥有全国一流的医疗团队，自建院时起至今......', 'http://jiaowu.buaa.edu.cn'),
(27, 4, '天津市宁河县医院', '天津', '天津', '天津市宁河县芦台镇沿河路23号', '022-69560457， 69560782', '天津市宁河县医院是一所致力于救死扶伤的知名医疗机构，位于天津市宁河县芦台镇沿河路23号。医院拥有全国一流的医疗团队，自建院时起至今......', 'http://jiaowu.buaa.edu.cn'),
(28, 8, '重庆西南医院', '重庆', '重庆', '重庆市沙坪坝区高滩岩正街30号', '023-68754000', '重庆西南医院是一所致力于救死扶伤的知名医疗机构，位于重庆市沙坪坝区高滩岩正街30号。医院拥有全国一流的医疗团队，自建院时起至今......', 'http://jiaowu.buaa.edu.cn'),
(29, 8, '重庆医科大学附属儿童医院', '重庆', '重庆', '重庆市渝中区中山二路136号', '023-63632756', '重庆医科大学附属儿童医院是一所致力于救死扶伤的知名医疗机构，位于重庆市渝中区中山二路136号。医院拥有全国一流的医疗团队，自建院时起至今......', 'http://jiaowu.buaa.edu.cn'),
(30, 8, '重庆医科大学附属第一医院', '重庆', '重庆', '重庆市渝中区袁家岗友谊路1号', '023-68811360', '重庆医科大学附属第一医院是一所致力于救死扶伤的知名医疗机构，位于重庆市渝中区袁家岗友谊路1号。医院拥有全国一流的医疗团队，自建院时起至今......', 'http://jiaowu.buaa.edu.cn'),
(31, 8, '重庆医科大学附属第二医院', '重庆', '重庆', '中国重庆市临江路76号', '023-63693000', '重庆医科大学附属第二医院是一所致力于救死扶伤的知名医疗机构，位于中国重庆市临江路76号。医院拥有全国一流的医疗团队，自建院时起至今......', 'http://jiaowu.buaa.edu.cn'),
(32, 8, '中国医科大学附属第一医院', '辽宁', '沈阳', '辽宁省沈阳市和平区南京北街155号', '024-83283333', '中国医科大学附属第一医院是一所致力于救死扶伤的知名医疗机构，位于辽宁省沈阳市和平区南京北街155号。医院拥有全国一流的医疗团队，自建院时起至今......', 'http://jiaowu.buaa.edu.cn'),
(33, 8, '沈阳市第四人民医院', '辽宁', '沈阳', '辽宁省沈阳市皇姑区黄河南大街20号', '024-86862514', '沈阳市第四人民医院是一所致力于救死扶伤的知名医疗机构，位于辽宁省沈阳市皇姑区黄河南大街20号。医院拥有全国一流的医疗团队，自建院时起至今......', 'http://jiaowu.buaa.edu.cn'),
(34, 8, '沈阳二0一医院', '辽宁', '沈阳', '沈阳市大东区新东一街12号', '400-6626-201', '沈阳二0一医院是一所致力于救死扶伤的知名医疗机构，位于沈阳市大东区新东一街12号。医院拥有全国一流的医疗团队，自建院时起至今......', 'http://jiaowu.buaa.edu.cn'),
(35, 8, '沈阳463医院', '辽宁', '沈阳', '辽宁省沈阳市大东区小河沿路46号', '024-28845246', '沈阳463医院是一所致力于救死扶伤的知名医疗机构，位于辽宁省沈阳市大东区小河沿路46号。医院拥有全国一流的医疗团队，自建院时起至今......', 'http://jiaowu.buaa.edu.cn'),
(36, 8, '沈阳市第五人民医院', '辽宁', '沈阳', '辽宁省沈阳市铁西区兴顺街188号', '024-25403783', '沈阳市第五人民医院是一所致力于救死扶伤的知名医疗机构，位于辽宁省沈阳市铁西区兴顺街188号。医院拥有全国一流的医疗团队，自建院时起至今......', 'http://jiaowu.buaa.edu.cn'),
(37, 8, '大连医科大学附属第二医院', '辽宁', '大连', '总院:大连市沙河口区中山路467号;北院:甘井子区...', '0411-84671291', '大连医科大学附属第二医院是一所致力于救死扶伤的知名医疗机构，位于总院:大连市沙河口区中山路467号;北院:甘井子区...。医院拥有全国一流的医疗团队，自建院时起至今......', 'http://jiaowu.buaa.edu.cn'),
(38, 9, '沈阳市红十字会医院', '辽宁', '沈阳', '辽宁省沈阳市沈河区中山路389号', '024-22955757 ，22942012--3...', '沈阳市红十字会医院是一所致力于救死扶伤的知名医疗机构，位于辽宁省沈阳市沈河区中山路389号。医院拥有全国一流的医疗团队，自建院时起至今......', 'http://jiaowu.buaa.edu.cn'),
(39, 8, '中国医科大学附属盛京医院', '辽宁', '沈阳', '辽宁省沈阳市和平区三好街36号', '024-83955555', '中国医科大学附属盛京医院是一所致力于救死扶伤的知名医疗机构，位于辽宁省沈阳市和平区三好街36号。医院拥有全国一流的医疗团队，自建院时起至今......', 'http://jiaowu.buaa.edu.cn'),
(40, 8, '大连医科大学附属第一医院', '辽宁', '大连', '辽宁省大连市中山路222号', '0411-83635963', '大连医科大学附属第一医院是一所致力于救死扶伤的知名医疗机构，位于辽宁省大连市中山路222号。医院拥有全国一流的医疗团队，自建院时起至今......', 'http://jiaowu.buaa.edu.cn'),
(41, 8, '中国人民解放军第461医院', '吉林', '长春', '长春市自由大路108号', '0431-88502999', '中国人民解放军第461医院是一所致力于救死扶伤的知名医疗机构，位于长春市自由大路108号。医院拥有全国一流的医疗团队，自建院时起至今......', 'http://jiaowu.buaa.edu.cn'),
(42, 8, '长春市妇产医院', '吉林', '长春', '吉林省长春市南关区西五马路555号', '0431-82903600', '长春市妇产医院是一所致力于救死扶伤的知名医疗机构，位于吉林省长春市南关区西五马路555号。医院拥有全国一流的医疗团队，自建院时起至今......', 'http://jiaowu.buaa.edu.cn'),
(43, 8, '长春市中医院', '吉林', '长春', '吉林省长春市工农大路1478号', '0431-85669120', '长春市中医院是一所致力于救死扶伤的知名医疗机构，位于吉林省长春市工农大路1478号。医院拥有全国一流的医疗团队，自建院时起至今......', 'http://jiaowu.buaa.edu.cn'),
(44, 8, '长春市儿童医院', '吉林', '长春', '吉林省长春市北安路1175号', '0431-85802114', '长春市儿童医院是一所致力于救死扶伤的知名医疗机构，位于吉林省长春市北安路1175号。医院拥有全国一流的医疗团队，自建院时起至今......', 'http://jiaowu.buaa.edu.cn'),
(45, 8, '吉林大学第二医院', '吉林', '长春', '吉林省长春市自强街218号', '0431-88796114', '吉林大学第二医院是一所致力于救死扶伤的知名医疗机构，位于吉林省长春市自强街218号。医院拥有全国一流的医疗团队，自建院时起至今......', 'http://jiaowu.buaa.edu.cn'),
(46, 8, '吉林大学口腔医院', '吉林', '长春', '吉林省长春市朝阳区清华路1500号', '0431-85579567', '吉林大学口腔医院是一所致力于救死扶伤的知名医疗机构，位于吉林省长春市朝阳区清华路1500号。医院拥有全国一流的医疗团队，自建院时起至今......', 'http://jiaowu.buaa.edu.cn'),
(47, 8, '长春中医药大学附属医院', '吉林', '长春', '吉林省长春市朝阳区工农大路1478号', '0431-85669120', '长春中医药大学附属医院是一所致力于救死扶伤的知名医疗机构，位于吉林省长春市朝阳区工农大路1478号。医院拥有全国一流的医疗团队，自建院时起至今......', 'http://jiaowu.buaa.edu.cn'),
(48, 8, '吉林大学中日联谊医院', '吉林', '长春', '吉林省长春市仙台大街126号', '0431-84995114', '吉林大学中日联谊医院是一所致力于救死扶伤的知名医疗机构，位于吉林省长春市仙台大街126号。医院拥有全国一流的医疗团队，自建院时起至今......', 'http://jiaowu.buaa.edu.cn'),
(49, 8, '吉林省人民医院', '吉林', '长春', '吉林省长春市朝阳区工农大路1183号', '0431-85595114', '吉林省人民医院是一所致力于救死扶伤的知名医疗机构，位于吉林省长春市朝阳区工农大路1183号。医院拥有全国一流的医疗团队，自建院时起至今......', 'http://jiaowu.buaa.edu.cn'),
(50, 8, '吉林大学第四医院', '吉林', '长春', '吉林省长春市东风大街2643号', '0431-85906812', '吉林大学第四医院是一所致力于救死扶伤的知名医疗机构，位于吉林省长春市东风大街2643号。医院拥有全国一流的医疗团队，自建院时起至今......', 'http://jiaowu.buaa.edu.cn');

-- --------------------------------------------------------

--
-- 表的结构 `hospital_rating`
--

CREATE TABLE IF NOT EXISTS `hospital_rating` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `meaning` varchar(50) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `meaning` (`meaning`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_bin AUTO_INCREMENT=11 ;

--
-- 转存表中的数据 `hospital_rating`
--

INSERT INTO `hospital_rating` (`id`, `meaning`) VALUES
(3, '一级丙等医院'),
(2, '一级乙等医院'),
(1, '一级甲等医院'),
(10, '三级丙等医院'),
(9, '三级乙等医院'),
(7, '三级特等医院'),
(8, '三级甲等医院'),
(6, '二级丙等医院'),
(5, '二级乙等医院'),
(4, '二级甲等医院');

-- --------------------------------------------------------

--
-- 表的结构 `user`
--

CREATE TABLE IF NOT EXISTS `user` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `realname` varchar(20) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `password` varchar(50) COLLATE utf8_bin NOT NULL,
  `tel` varchar(50) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `socialid` varchar(50) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `credit` tinyint(4) NOT NULL,
  `email` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `isactivated` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_name` (`name`),
  UNIQUE KEY `user_socialid` (`socialid`),
  UNIQUE KEY `user_email` (`email`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_bin AUTO_INCREMENT=6 ;

--
-- 转存表中的数据 `user`
--

INSERT INTO `user` (`id`, `name`, `realname`, `password`, `tel`, `socialid`, `credit`, `email`, `isactivated`) VALUES
(1, 'HeavenDuke', '荣芓萌', '0f81c7a9b9b686702e1574fb40dbc338', '11111111111', '210103199408152118', 5, '1111111@qq.com', 0),
(2, 'trashlhc', '渣诚', 'b3afa8c6108945f609df3ca34d5688f8', '12222222222', '210103199408152119', 5, '2222222@qq.com', 1),
(3, 'sabbyszm', '大帝', '50375417e611cdc512d5362f5fafb425', '13333333333', '210103199408152120', 3, '3333333@qq.com', 1),
(4, 'zhugongpu', '朱公仆', '5abf0d8358b256ed5ecf24fba3db5e37', '14444444444', '210103199408152121', 5, '4444444@qq.com', -1),
(5, 'sabbyszm2', '宋子明', '764eb40905d51327d67f469602d0d811', '15555555555', '210103199408152122', 0, '5555555@qq.com', -1);

-- --------------------------------------------------------

--
-- 表的结构 `working`
--

CREATE TABLE IF NOT EXISTS `working` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `doctor_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `period` tinyint(1) NOT NULL,
  `frequency` char(8) COLLATE utf8_bin NOT NULL,
  `total_app` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin AUTO_INCREMENT=1 ;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

const tabs = [
  { id: 'dashboard', limport { BarChart3, Database, Globe, Brain, Bot, Settings, MessageSquare, CreditCard, Users, TrendingUp, Package, Zap, RefreshCw, Download, Upload, Eye, CreditCard as Edit, Trash2, Plus, Search, Filter, Calendar, DollarSign, ShoppingCart, Star, AlertCircle, CheckCircle, Clock, Target, Palette, Code, Smartphone, Monitor, Tablet, Mail, Phone, MapPin, ExternalLink, Copy, Share2, QrCode, Wifi, Activity, PieChart, LineChart, BarChart, TrendingDown, ArrowUp, ArrowDown, Percent, Hash, FileText, Image, Video, Music, File, Folder, FolderOpen, Archive, Bookmark, Tag, Flag, Heart, ThumbsUp, ThumbsDown, MessageCircle, Send, Reply, Forward, Paperclip, Link, Lock, Unlock, Shield, Key, UserCheck, UserX, UserPlus, UserMinus, Crown, Award, Medal, Trophy, Gift, Sparkles, Flame, Snowflake, Sunoon, Cloud, CloudRain, CloudSnow, Umbrella, Thermometer, Wi Compass, Map, Navigation, Plane, Car, Truck, Ship, Brain as ra, Bike, Wallet as Walk, Home, Building, Stoe,actory, School, Guitar as Hospital, Church, Ban as Bank, ot, ListRestart as Restaurant, Car as Cafe, ShoppingBag, Briefe, Laptop, LampDesk as Desktop, Tablet as TabletIcon, Smartpe as SmartphoneIcon, Watch, Headphones, Camera, Mic, Speaker, Voe2, VolumeX, Play, Pause, Store as Stop, SkipBack, SForward, Repeat, Shuffle, Radio, Tv, Gamepad2, Joystick, e1, Dice2, Dice3, Dice4, Dice5, Dice6, Spade, Club, Diamond, Heart HeartSuit, Puzzle, Lightbulb, Rocket, Anchor, Feather, Leaf, Ts as Tree, Flower, Flower2, Bug, Fish, Bird, Cat, Dog, Rit, il, Router as Butterfly, Befs Bee, Sliders as Spider, Wokfloas Worm, Egg, Footprints, PawPrint as Paw, Bone, Mil, BeefCherry, Apple, Banana, Grape, Tangent as Orange, Diamond as Lemon, Cerry aStrawberry, GlassWater as Watermelon, Trelo as Mel, Apple as Pineapple, Donut as Coconut, Locate as Avocado, Egg as Eggplat, Rotatd as Potato, Carrot, Popcorn as Corn, CaseUpper as Pepper, Dumbbellas Cucber, Atm asomato, ptioas Onion, Slice as Garlic, Chrome as Mushroom Bn as Pet, ihecks as Chestnut, Heading as BradCroissant, Badge as Bagel, Dletes Pretzel, Cake as Pancakes, Shuffle as Waffle, Userheck aCheese, Wheat as Meat, Vault as Poultry, Barcode as Bacon, Hamer as m, Pizza, Merge as Hamburger, EggFried as ries, Hol as Hotdog, Sandwich, Tag as Taco, Monitor as Burrito, Salad, Soup, SepBack aStew, Currency as Curry, Settings as Spaghetti, Flame as Ramen, Bruh as Shi, LayutTelate asTempa, Indent as Oden, Tangent as Dango, Die1s Rice,ickaas Riceball, CakeSlice as RiceckeCookie, Cake, Cake as Cupcak, Pis Pie, Locate as Chocolate, Candy, Lollipop, Bone asHoney,ilk as MilkIcon, Baby, Bot as Bottle, Coffee, Bean as Tea, Cake a Sake,eer, Wine, FileLock as Cocktail, Dice1 as uice, Cuoda as Soda, Heater as Water, IceCream as Ice } from 'lucide-react'iv>
        <span className="text-blue-300 text-sm">Boutique en ligne</span>
      </div>
    </div>
    <ShopPageBuilder 
      retailerId={vendorId} 
      companyName={companyName}
      subdomain={companyName?.toLowerCase().replace(/[^a-z0-9]/g, '-')}
    />
  </div>
);

const renderMLTraining = () => (
  <div className="space-y-8">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold text-white">Entraînement IA</h2>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
        <span className="text-purple-300 text-sm">Smart AI actif</span>
      </div>
    </div>
    <SmartAIEnrichmentTab retailerId={vendorId} />
  </div>
);

switch (activeTab) {
  case 'catalogue':
    return renderCatalogue();
  case 'enriched':
    return renderEnriched();
  case 'seo':
    return renderSEO();
  case 'google-ads':
    return renderGoogleAds();
  case 'shop-page':
    return renderShopPage();
  case 'integration':
    return renderIntegration();
  case 'ml-training':
    return renderMLTraining();
  case 'robot':
    return renderRobot();
  case 'api-test':
    return renderAPITest();
  case 'historique':
    return renderHistorique();
  case 'abonnement':
    return renderAbonnement();
  case 'settings':
    return renderSettings();
  default:
    return renderDashboard();
}
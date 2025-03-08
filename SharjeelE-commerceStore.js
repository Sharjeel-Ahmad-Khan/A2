import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  Modal,
  Button,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const App = () => {
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [aboutVisible, setAboutVisible] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = [
    { id: 'all', name: 'All', icon: 'apps' },
    { id: 'electronics', name: 'Electronics', icon: 'tv' },
    { id: 'clothes', name: 'Clothes', icon: 'shopping-bag' },
    { id: 'mobiles', name: 'Mobiles', icon: 'phone' },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('https://fakestoreapi.com/products');
        setProducts(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(
    (product) =>
      (selectedCategory === 'All' || product.category === selectedCategory) &&
      product.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const discount = totalAmount > 100 ? totalAmount * 0.1 : 0;
  const finalAmount = totalAmount - discount;

  const openProductDetail = (product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const renderProduct = ({ item }) => (
    <View style={styles.productCard}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <Text style={styles.productName}>{item.title}</Text>
      <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
      <TouchableOpacity style={styles.addToCartButton} onPress={() => addToCart(item)}>
        <Text style={styles.addToCartText}>Add to Cart</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.viewDetailsButton} onPress={() => openProductDetail(item)}>
        <Text style={styles.viewDetailsText}>View Details</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.id && styles.selectedCategoryItem,
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <MaterialIcons name={item.icon} size={24} color="#000" />
      <Text style={styles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Sharjeel E-commerce Store</Text>
        <TouchableOpacity style={styles.cartIcon} onPress={() => setCheckoutVisible(true)}>
          <MaterialIcons name="shopping-cart" size={30} color="#000" />
          {cart.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cart.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search products..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Categories */}
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
      />

      {/* Product List */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.productList}
      />

      {/* Product Details Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          {selectedProduct && (
            <>
              <Image source={{ uri: selectedProduct.image }} style={styles.modalImage} />
              <Text style={styles.modalProductName}>{selectedProduct.title}</Text>
              <Text style={styles.modalProductPrice}>${selectedProduct.price.toFixed(2)}</Text>
              <Button title="Close" onPress={() => setModalVisible(false)} />
            </>
          )}
        </View>
      </Modal>

      {/* Checkout Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={checkoutVisible}
        onRequestClose={() => setCheckoutVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.cartHeader}>Your Cart</Text>
          {cart.map((item, index) => (
            <View key={index} style={styles.cartItem}>
              <Text style={styles.cartItemText}>
                {item.title} (x{item.quantity}) - ${(item.price * item.quantity).toFixed(2)}
              </Text>
              <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                <Text style={styles.removeItemText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}
          <Text style={styles.totalAmount}>Subtotal: ${totalAmount.toFixed(2)}</Text>
          {discount > 0 && (
            <Text style={styles.discount}>Discount: -${discount.toFixed(2)}</Text>
          )}
          <Text style={styles.finalAmount}>Total: ${finalAmount.toFixed(2)}</Text>

          {/* Payment Methods */}
          <Text style={styles.paymentHeader}>Select Payment Method:</Text>
          <TouchableOpacity style={styles.paymentMethod}>
            <FontAwesome name="bank" size={24} color="#000" />
            <Text style={styles.paymentText}>Bank Transfer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.paymentMethod}>
            <Ionicons name="phone-portrait" size={24} color="#000" />
            <Text style={styles.paymentText}>Easypaisa</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.paymentMethod}>
            <FontAwesome name="money" size={24} color="#000" />
            <Text style={styles.paymentText}>JazzCash</Text>
          </TouchableOpacity>

          <Button title="Proceed to Payment" onPress={() => alert('Payment Successful!')} />
          <Button title="Close" onPress={() => setCheckoutVisible(false)} />
        </View>
      </Modal>

      {/* About Section */}
      <TouchableOpacity style={styles.aboutButton} onPress={() => setAboutVisible(true)}>
        <Text style={styles.aboutButtonText}>About</Text>
      </TouchableOpacity>

      {/* About Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={aboutVisible}
        onRequestClose={() => setAboutVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.aboutHeader}>About Us</Text>
          <Text style={styles.aboutText}>Email: editingu77@gmail.com</Text>
          <Text style={styles.aboutText}>Instagram: @shargeelahmadkhan</Text>
          <Button title="Close" onPress={() => setAboutVisible(false)} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  cartIcon: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    right: -5,
    top: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
  },
  searchBar: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  categoryList: {
    marginBottom: 20,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 20,
  },
  selectedCategoryItem: {
    borderBottomWidth: 2,
    borderBottomColor: '#007bff',
  },
  categoryText: {
    fontSize: 14,
    marginTop: 5,
  },
  productCard: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
  },
  productImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  productPrice: {
    fontSize: 16,
    color: '#888',
    marginBottom: 10,
  },
  addToCartButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
  },
  viewDetailsButton: {
    backgroundColor: '#ffc107',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  viewDetailsText: {
    color: '#fff',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    padding: 20,
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
    resizeMode: 'cover',
  },
  modalProductName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalProductPrice: {
    fontSize: 18,
    color: '#888',
    marginBottom: 20,
  },
  cartHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cartItemText: {
    fontSize: 16,
  },
  removeItemText: {
    color: 'red',
    fontSize: 16,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
  },
  discount: {
    fontSize: 16,
    color: 'green',
  },
  finalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  paymentHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  paymentText: {
    fontSize: 16,
    marginLeft: 10,
  },
  aboutButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
  aboutButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  aboutHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  aboutText: {
    fontSize: 16,
    marginBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
});

export default App;

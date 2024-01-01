# 实践-recyclerview分组

## 1. 创建数据类

``` java
public class Item {
    private String name;
    private String category;

    public Item(String name, String category) {
        this.name = name;
        this.category = category;
    }

    public String getName() {
        return name;
    }

    public String getCategory() {
        return category;
    }
}

```

## 2.Activity

``` java
import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import java.util.List;
import java.util.Map;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        RecyclerView recyclerView = findViewById(R.id.recyclerView);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));

        List<Item> itemList = generateSampleData();
        Map<String, List<Item>> groupedItems = groupItemsByCategory(itemList);

        List<String> categories = new ArrayList<>(groupedItems.keySet());
        GroupedRecyclerViewAdapter adapter = new GroupedRecyclerViewAdapter(categories, groupedItems);
        recyclerView.setAdapter(adapter);
    }

    private List<Item> generateSampleData() {
        List<Item> itemList = new ArrayList<>();
        itemList.add(new Item("Item 1", "Category A"));
        itemList.add(new Item("Item 2", "Category A"));
        itemList.add(new Item("Item 3", "Category B"));
        itemList.add(new Item("Item 4", "Category B"));
        itemList.add(new Item("Item 5", "Category C"));
        itemList.add(new Item("Item 6", "Category C"));
        return itemList;
    }

    private Map<String, List<Item>> groupItemsByCategory(List<Item> itemList) {
        Map<String, List<Item>> groupedItems = new HashMap<>();

        for (Item item : itemList) {
            String category = item.getCategory();

            if (!groupedItems.containsKey(category)) {
                groupedItems.put(category, new ArrayList<>());
            }

            groupedItems.get(category).add(item);
        }

        return groupedItems;
    }
}

```

## 3.Adapter

``` java
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.List;
import java.util.Map;

public class GroupedRecyclerViewAdapter extends RecyclerView.Adapter<RecyclerView.ViewHolder> {

    private static final int TYPE_HEADER = 0;
    private static final int TYPE_ITEM = 1;

    private List<String> categories;
    private Map<String, List<Item>> groupedItems;

    public GroupedRecyclerViewAdapter(List<String> categories, Map<String, List<Item>> groupedItems) {
        this.categories = categories;
        this.groupedItems = groupedItems;
    }

    @NonNull
    @Override
    public RecyclerView.ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        LayoutInflater inflater = LayoutInflater.from(parent.getContext());

        if (viewType == TYPE_HEADER) {
            View headerView = inflater.inflate(R.layout.item_header, parent, false);
            return new HeaderViewHolder(headerView);
        } else {
            View itemView = inflater.inflate(R.layout.item_layout, parent, false);
            return new ItemViewHolder(itemView);
        }
    }

    @Override
    public void onBindViewHolder(@NonNull RecyclerView.ViewHolder holder, int position) {
        if (holder instanceof HeaderViewHolder) {
            ((HeaderViewHolder) holder).bind(categories.get(position));
        } else if (holder instanceof ItemViewHolder) {
            String category = categories.get(position);
            List<Item> items = groupedItems.get(category);
            ((ItemViewHolder) holder).bind(items);
        }
    }

    @Override
    public int getItemCount() {
        return categories.size();
    }

    @Override
    public int getItemViewType(int position) {
        return position == 0 ? TYPE_HEADER : TYPE_ITEM;
    }

    private static class HeaderViewHolder extends RecyclerView.ViewHolder {
        private TextView headerTextView;

        HeaderViewHolder(@NonNull View itemView) {
            super(itemView);
            headerTextView = itemView.findViewById(R.id.headerTextView);
        }

        void bind(String headerText) {
            headerTextView.setText(headerText);
        }
    }

    private static class ItemViewHolder extends RecyclerView.ViewHolder {
        private TextView itemTextView;

        ItemViewHolder(@NonNull View itemView) {
            super(itemView);
            itemTextView = itemView.findViewById(R.id.itemTextView);
        }

        void bind(List<Item> items) {
            itemTextView.setText(items.toString());
        }
    }
}
```
## 4.item_header.xml
```xml
<!-- item_header.xml -->
<TextView
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/headerTextView"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:paddingStart="16dp"
    android:paddingEnd="16dp"
    android:paddingTop="8dp"
    android:paddingBottom="8dp"
    android:textSize="18sp"
    android:textStyle="bold"
    android:background="#E0E0E0"
    android:layout_marginTop="8dp"
    android:layout_marginBottom="8dp"/>

```

## 5.item_layout.xml

``` xml
<!-- item_layout.xml -->
<TextView
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/itemTextView"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:paddingStart="16dp"
    android:paddingEnd="16dp"
    android:paddingTop="8dp"
    android:paddingBottom="8dp"/>

```